
import { Difficulty } from "src/app/components/difficulty-screen/scoring-system";
import { EventLog } from "../../classes/Datastructure/event-log/event-log";
import { Trace } from "../../classes/Datastructure/event-log/trace";
import { TraceEvent } from "../../classes/Datastructure/event-log/trace-event";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})

export class EventlogGeneratorService {
  private alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  generateEventlog(diff: Difficulty = Difficulty.Easy): EventLog {
    const lp = new LabelPool(this.alphabet);

    let cuts: number = 1;
    const allowed: CutType[] = ["SEQ", "XOR", "AND", "LOOP"];

    switch (diff) {
      case Difficulty.Easy:
        cuts = 1;
        break;
      case Difficulty.Medium:
        cuts = rand(2, 3);
        break;
      case Difficulty.Hard:
        cuts = rand(3, 4);
        break;
    }

    const tree = buildTree(cuts, allowed, lp, false, 0, diff);
    return toEventLog(traces(tree));
  }
}

type CutType = "SEQ" | "XOR" | "AND" | "LOOP";

interface LeafNode { kind: "leaf"; labels: string[]; }
interface CutNode { kind: "cut"; cut: CutType; children: ProcessNode[]; }
type ProcessNode = LeafNode | CutNode;

class LabelPool {
  private i = 0;
  constructor(private traceEvents = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")) { }
  next(): string {
    const label =
      this.traceEvents[this.i % this.traceEvents.length] +
      (this.i >= this.traceEvents.length ? Math.floor(this.i / this.traceEvents.length) : "");
    this.i++;
    return label;
  }
}

const rand = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1));

function pickCut(
  available: CutType[],
  restrictedUsed: boolean,
  depth: number,
  diff: Difficulty,
  parentCut: CutType | null,
): CutType {
  // Base weights
  const cutWeights: Record<CutType, number> = { SEQ: 4, XOR: 4, AND: 4, LOOP: 4 };

  // Adjust weights based on difficulty
  if (diff !== Difficulty.Easy) {
    // Medium and Hard keep AND/LOOP rarer near the root
    const shallow: number = 1;   // shallow = root & depth 1
    const deep: number = 2;   // deep = depth ≥ 2
    cutWeights.AND = (restrictedUsed || depth < 2) ? shallow : deep; // AND is less likely if already used or at root/depth 1
    cutWeights.LOOP = (restrictedUsed || depth < 2) ? shallow : deep; // LOOP is less likely if already used or at root/depth 1
  }

  // Adjust weights based on parent cut:Decrease probability of same cut as parent
  if (parentCut) cutWeights[parentCut] *= 0.3;   // 70 % less likely

  // Filter out restricted cuts
  const valid: CutType[] = available.filter(cutWeight => cutWeights[cutWeight] > 0);
  const total: number = valid.reduce((s, c) => s + cutWeights[c], 0);

  // Pick a cut randomly based on weights + rng
  let pick: number = Math.random() * total;
  for (const cutType of valid) { // iterate through valid cuts and subtract their weights
    pick -= cutWeights[cutType];
    if (pick <= 0) return cutType;
  }

  // Fallback
  return valid[valid.length - 1];
}

function buildTree(
  cutsLeft: number,
  allowedCuts: CutType[],
  lp: LabelPool,
  restrictedUsed = false,
  depth = 0,
  diff: Difficulty,
  insideParallel = false,
  parentCut: CutType | null = null
): ProcessNode {

  // Exit condition: no cuts left --> Leaf node
  if (cutsLeft === 0) {
    const leafLen = insideParallel ? 1 : rand(1, 2); // Only 1 label if inside parallel, else 1 or 2
    return { kind: "leaf", labels: Array.from({ length: leafLen }, () => lp.next()) };
  }

  // Pick a cut type for current node
  const eff = restrictedUsed ? allowedCuts.filter(c => c !== "AND" && c !== "LOOP") : allowedCuts; // Exclude AND/LOOP if already used
  const cut = pickCut(eff, restrictedUsed, depth, diff, parentCut); // Select next cut type, depending on difficulty, depth, and parent cut

  // Distribute remaining cuts randomly to child nodes
  const cutsLeftNode = rand(0, cutsLeft - 1); // Random amount of cuts for left child node
  const cutsRightNode = cutsLeft - 1 - cutsLeftNode; // Remaining cuts for right child node


  const restrictedNow = restrictedUsed || cut === "AND" || cut === "LOOP"; // restrict AND/LOOP, if used in parent or current node to Ban these cuts in children
  const inParNext = insideParallel || cut === "AND"; // 

  return {
    kind: "cut",
    cut,
    children: [
      buildTree(cutsLeftNode, allowedCuts, lp, restrictedNow, depth + 1, diff, inParNext, cut),
      buildTree(cutsRightNode, allowedCuts, lp, restrictedNow, depth + 1, diff, inParNext, cut)
    ]
  };
}

// #########################  Trace generation  ############################
type TraceArr = string[];

function seq(a: TraceArr[], b: TraceArr[]): TraceArr[] {
  const result: TraceArr[] = [];
  for (const first of a) {
    for (const second of b) {
      result.push([...first, ...second]);
    }
  }
  return result;
}

function interleave(a: TraceArr, b: TraceArr): TraceArr[] {
  if (a.length === 0) return [b];
  if (b.length === 0) return [a];

  const withAFirst = interleave(a.slice(1), b).map(seq => [a[0], ...seq]);
  const withBFirst = interleave(a, b.slice(1)).map(seq => [b[0], ...seq]);

  return withAFirst.concat(withBFirst);
}

const MAX_LOOP_ITERS = 3;
function traces(node: ProcessNode): TraceArr[] {
  if (node.kind === "leaf") return [[...node.labels]];

  // Get traces recursively from children (process tree)
  const [l, r] = node.children.map(traces);

  switch (node.cut) {
    case "SEQ":
      return seq(l, r);
    case "XOR":
      return [...l, ...r];
    case "AND": {
      const result: TraceArr[] = [];
      for (const left of l) {
        for (const right of r) {
          result.push(...interleave(left, right));
        }
      }
      return result;
    }
    case "LOOP": {
      const body = l;
      const redo = r;
      let result: TraceArr[] = [];
      let current: TraceArr[] = [[]];
      for (let i = 1; i <= MAX_LOOP_ITERS; i++) {
        current = seq(current, body);
        result.push(...current);
        current = seq(current, redo);
      }
      return result;
    }
  }
}

// Traces to one Eventlog
const toEventLog = (trace: TraceArr[]): EventLog =>
  new EventLog(trace.map(t => new Trace(t.map(label => new TraceEvent(label)))));

// Eventlog to parseable string (A B + C D + ...)
export const eventlogToString = (eventlog: EventLog): string =>
  eventlog.traces.map(trace => trace.events.map(e => e.conceptName).join(" ")).join(" + ");