
import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, Output, ViewChild } from '@angular/core';
import { DisplayService } from '../../services/display.service';
import { catchError, of, Subscription, take } from 'rxjs';
import { SvgService } from '../../services/svg.service';
import { ExampleFileComponent } from "../example-file/example-file.component";
import { FileReaderService } from "../../services/file-reader.service";
import { HttpClient } from "@angular/common/http";
import { InductivePetriNet } from 'src/app/classes/Datastructure/InductiveGraph/inductivePetriNet';
import { InductiveMinerService } from "../../services/inductive-miner/inductive-miner.service";
import { TraceEvent } from "../../classes/Datastructure/event-log/trace-event";
import { Edge } from "../../classes/Datastructure/InductiveGraph/edgeElement";
import { DFGElement } from "../../classes/Datastructure/InductiveGraph/Elements/DFGElement";
import { IntersectionCalculatorService } from "../../services/intersection-calculator.service";
import svgPanZoom from 'svg-pan-zoom';
import { SvgLayoutService } from 'src/app/services/svg-layout.service';
import { SvgArrowService } from 'src/app/services/svg-arrow.service';
import { EventLog } from 'src/app/classes/Datastructure/event-log/event-log';
import { Layout } from 'src/app/classes/Datastructure/enums';
import { PNMLWriterService } from 'src/app/services/file-export.service';
import { FallThroughService } from 'src/app/services/inductive-miner/fall-throughs';
import { MatSnackBar } from "@angular/material/snack-bar";
import { RecursiveNode } from 'src/app/classes/Datastructure/InductiveGraph/Elements/recursiveNode';
import { GameTimerComponent } from '../game-timer/game-timer';
import { TextParserService } from 'src/app/services/text-parser.service';
import { Difficulty, SCORE_CONFIG } from 'src/app/components/difficulty-screen/scoring-system';

@Component({
    selector: 'app-display',
    templateUrl: './display.component.html',
    styleUrls: ['./display.component.css']
})

export class DisplayComponent implements OnDestroy {

    @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;
    @ViewChild('gameTimer') gameTimer!: GameTimerComponent | undefined;

    @Output('fileContent') fileContent: EventEmitter<string>;

    drawingAreaHeight: number = 600;

    //TODO: Lasse den User über einen Switch alles auswählen
    // Game Settings
    confirmCut: boolean = true;

    // Game Runtime Info
    gameRunning: boolean = false; // To end the game, stop the timer, etc.
    gameFinished: boolean = false; // For the game summary screen
    customMode: boolean = false;

    // Game Stats
    currentStage: number = 0; // Keeping track of the current stage
    totalStages: number = 5;
    selectedDifficulty!: Difficulty;
    onDifficultyChange(difficulty: Difficulty) {
        this.selectedDifficulty = difficulty;
    }

    // Player Info
    userLevel: number = 1;
    userExp: number = 0;
    expNeeded: number = 200;

    // Performance
    totalTime: number = 0;
    stageTimes: number[] = []; // Time Player needed for each stage

    stageScore: number[] = []; // Score Player achieved for each stage
    totalScore = this.sumOfList(this.stageScore);

    expEarned: number = 0;

    //Bedingung, damit der Button zum Download angezeigt wird. Siehe draw Methode
    private _isPetriNetFinished: boolean = false;
    isDFGinNet = false;

    availableLayouts = Object.values(Layout); // Extract the enum values as an array
    selectedLayout: Layout | null = this._svgLayoutService.getLayout(); // Set a default layout
    isSpringEmbedder: boolean = true;

    colouredBoxesEnabled = RecursiveNode.colouredBoxes;

    private _sub: Subscription;
    private _petriNet: InductivePetriNet | null = null;
    private _leftMouseDown = false;
    private zoomInstance: SvgPanZoom.Instance | undefined = undefined;
    isZoomInstanceInitialized = false;

    private _markedEdges: SVGLineElement[] = [];
    // to keep track in which event log the lines are drawn
    private _selectedEventLog?: EventLog;
    private _previouslySelected?: EventLog;

    constructor(
        private _svgService: SvgService,
        private _displayService: DisplayService,
        private _fileReaderService: FileReaderService,
        private _inductiveMinerService: InductiveMinerService,
        private _http: HttpClient,
        private _intersectionCalculatorService: IntersectionCalculatorService,
        private _pnmlWriterService: PNMLWriterService,
        private _svgLayoutService: SvgLayoutService,
        private _svgArrowService: SvgArrowService,
        private _fallThroughService: FallThroughService,
        private _snackbar: MatSnackBar,
        private _textParserService: TextParserService,
    ) {

        this.fileContent = new EventEmitter<string>();
        this._sub = this._displayService.InductivePetriNet$.subscribe(newNet => {
            this.isDFGinNet = false;
            this._petriNet = newNet;
            if (this._petriNet  != null) {
                this._petriNet.applyNewDFGLayout(this.selectedLayout);
            }
            this.setSelectedEventLog(undefined);
            this._previouslySelected = undefined;
            this.drawResetZoom();
            this.applyZoom();
        });
    }

    // Getters and Setters to start the next round of a level, up to 5 times
    get isPetriNetFinished(): boolean {
        return this._isPetriNetFinished;
    }

    set isPetriNetFinished(value: boolean) {
        console.log('Custom Mode: ', this.customMode, 'isPetriNetFinished: ', value);
        this._isPetriNetFinished = value;
        if (!this.customMode) {
            if (value) {
                if (this.currentStage < this.totalStages) {
                    this.startGame();
                    this.isSpringEmbedder = true;
                } else {
                    this.summarizeGame();
                }
            }
        }
    }

    // Gamification Methods

    // Calculations
    calculateExponentialScoreMs(timeInMs: number): number {
        const { maxScore, minScore, maxTimeMs } = SCORE_CONFIG[this.selectedDifficulty];

        // Ensure time is clamped
        const clampedTime = Math.min(timeInMs, maxTimeMs);

        // Adjustable decay rate based on maxTime
        const decayRate = 1.5 / maxTimeMs; // tune this value to control curve steepness

        const score = maxScore * Math.exp(-decayRate * clampedTime);

        // Normalize to fit minScore...maxScore range
        const normalizedScore = minScore + (score / maxScore) * (maxScore - minScore);

        return Math.round(normalizedScore);
    }

    // game-summary
    summarizeGame(): void {
        //Prepare everything to showcase the game summary
        this.gameRunning = false;
        this.gameFinished = true;
        this.clearDrawingArea();
        //this.currentStage = this.totalStages;
        this.stopGameTimer();
        this.totalTime = this.gameTimer?.getElapsedMs() ?? 0;
        console.log("HEREHERE", Array.from(this.stageScore));
        this.totalScore = this.sumOfList(this.stageScore);
    }

    onPlayAgain() {
        //Reset everything so the game can be played again
        //TODO: Also do this, when the site is loaded each time! --> Extract into function and ref
        this.resetGameTimer();
        this.currentStage = 0;
        this.gameFinished = false;
        this.stageTimes.length = 0;
        this.totalTime = 0;
        this.expEarned = 0;
        this.totalScore = 0;
        this.stageScore.length = 0;
        this._isPetriNetFinished = false;
        this.setDrawingAreaHeight(this.drawingAreaHeight, 100);
        this.clearDrawingArea();
        this.expEarned = 0;
        this.gameRunning = false;
        this.customMode = false;
        this.confirmCut = true; // Reset to Default, for Game Mode

        if (this.zoomInstance) {
            this.zoomInstance.destroy();
            this.zoomInstance = undefined;
        }
        this.setSelectedEventLog(undefined); // For Buttons to be disabled again
    }

    // Button shortcut-functionality
    get isCommonButtonDisabled(): boolean {
        return (
            (!this.selectedEventLog && !this.gameRunning) ||
            this.isPetriNetFinished ||
            (!this.selectedEventLog && this.selectedDifficulty !== 'Custom')
        );
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key === '1' && !this.isCommonButtonDisabled) {
            this.resetCut();
        }
        if (event.key === '2' && !this.isCommonButtonDisabled) {
            this.applyFallThrough();
        }
        if (event.key === '3' && !this.isCommonButtonDisabled) {
            this.applyLayoutToSelectedEventLog();
        }
        if (event.key === '4' && this.customMode) {
            this.performCut(true);
        }
    }

    setLayoutMode(mode: boolean): void {
        this.isSpringEmbedder = mode;
        this.applyLayout();
    }

    // Child Events
    onCustomModeInit(): void {
        //this.onPlayAgain(); // Reset everything first
        this.customMode = true;
        this.confirmCut = false; // Confirmation needed in custom mode
        this.setDrawingAreaHeightWidthAbsolute(600, 1760); // Hard Coded Pixel Width for Custom Mode. Might need to fix
        this._displayService.clear();
    }

    onToggleStageDetails(isExpanded: boolean): void {
        let height = 600;
        if (this.totalStages === 5) {
            height = 900;
        } else if (this.totalStages === 10) {
            height = 1150;
        }

        this.setDrawingAreaHeight(isExpanded ? height : this.drawingAreaHeight, 100);
    }

    onExpEarned(exp: number) {
        this.expEarned = exp;
    }

    onLevelUp(newLevel: number) {
        this.userLevel = newLevel;
        this._snackbar.open('Level Up!', 'Close', {
            duration: 3000,
        })
        if (this.userLevel === 3) {
            this._snackbar.open('Medium unlocked!', 'Close', {
                duration: 3000,
            })
        }
    }

    //custom mode
    goToMainMenu(): void {
        this.onPlayAgain();
        this.customMode = false;
    }

    // difficultyScreen  
    startGame(): void {
        this.currentStage++;
        const result = this._textParserService.parse('A B+');
        if (result) {
            this._displayService.display(new InductivePetriNet().init(result));
        }
    }

    onStagePicked(count: number): void {
        this.totalStages = count;
    }

    // Player-info-panel
    customUnlocked: boolean = false;
    currentStreak: number = 0;

    highscores: {
        score: number;
        difficulty: string;
        time: string;
        grade: string;
        totalStages: number;
    }[] = [];

    addHighscore(entry: typeof this.highscores[number]) {
        this.highscores.push(entry);

        // Keep only top 10 per mode (5 or 10 stages)
        const grouped = this.highscores
            .filter(s => s.totalStages === entry.totalStages)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        // Replace only that mode's list
        this.highscores = [
            ...this.highscores.filter(s => s.totalStages !== entry.totalStages),
            ...grouped
        ];
    }

    // Game Timer
    startGameTimer(): void {
        this.gameTimer?.startGameTimer();
    }
    stopGameTimer(): void {
        this.gameTimer?.stopGameTimer();
    }

    resetGameTimer(): void {
        this.gameTimer?.resetGameTimer();
    }

    recordLap(): void {
        let lapTime: number = this.gameTimer!.getElapsedMs();
        lapTime -= this.sumOfList(this.stageTimes); // subtract the previous lap times to get individual time
        this.stageTimes.push(lapTime);
    }

    sumOfList(list: number[]): number {
        return list.reduce((sum, num) => sum + num, 0);
    }




    // Inductive Miner Methods
    ngOnDestroy(): void {
        this._sub.unsubscribe();
        this.fileContent.complete();
    }

    toggleColouredBoxes(): void {
        RecursiveNode.colouredBoxes = this.colouredBoxesEnabled;
        this.resetCut();
        if (this.gameRunning || this.customMode) {
            this.drawResetZoom();
        }
    }


    applyLayout() {
        if (this.gameRunning || this.customMode) {
            this._petriNet!.applyNewDFGLayout(this.isSpringEmbedder ? Layout.SpringEmbedder : Layout.Sugiyama);
            // Sugiyama might change the zoom level and become bigger than the drawing area but that is a reasonable trade-off
            this.drawKeepZoom();
        }
    }

    setDrawingAreaHeight(height: number, width?: number) {
        const container = document.getElementById('resizableContainer');
        const drawingArea = document.getElementById('drawing');

        if (container && drawingArea) {
            container.style.height = `${height}px`;
            drawingArea.style.height = `${height}px`;
        }

        if (width) {
            container!.style.width = `${width}%`;
            drawingArea!.style.width = `${width}%`;
        }
    }

    setDrawingAreaHeightWidthAbsolute(height: number, width: number) {
        const container = document.getElementById('resizableContainer');
        const drawingArea = document.getElementById('drawing');

        if (container && drawingArea) {
            container.style.height = `${height}px`;
            drawingArea.style.height = `${height}px`;
        }

        if (width) {
            container!.style.width = `${width}px`;
            drawingArea!.style.width = `${width}px`;
        }
    }

    private noDFGinNet(): boolean {
        if (this.isDFGinNet) { return false }
        this._snackbar.open('No PetriNet initialized yet', 'Close', {
            duration: 3000,
        })
        return true;
    }

    private netFinishedSnackbar(): boolean {
        if (!this.isPetriNetFinished) { return false }
        this._snackbar.open('PetriNet is finished. Please import next EventLog', 'Close', {
            duration: 3000,
        })
        return true;
    }

    applyLayoutToSelectedEventLog() {
        if (this.noDFGinNet()) return;
        if (this.netFinishedSnackbar()) return;
        if (this._selectedEventLog === undefined) {
            this._snackbar.open('No eventlog marked', 'Close', {
                duration: 3000,
            })
            return;
        }
        if (this.selectedLayout === Layout.Sugiyama) {
            return;
        }
        this._petriNet!.applyLayoutToSingleDFG(this._selectedEventLog!);
        this.drawKeepZoom();
    }

    public processDropEvent(e: DragEvent) {
        e.preventDefault();

        const fileLocation = e.dataTransfer?.getData(ExampleFileComponent.META_DATA_CODE);

        if (fileLocation) {
            this.isSpringEmbedder = true;
            this.fetchFile(fileLocation);
        } else {
            this.isSpringEmbedder = false;
            this.readFile(e.dataTransfer?.files);
        }
    }

    public prevent(e: Event) {
        // dragover must be prevented for drop to work
        e.preventDefault();
    }

    private fetchFile(link: string) {
        this._http.get(link, {
            responseType: 'text'
        }).pipe(
            catchError(err => {
                console.error('Error while fetching file from link', link, err);
                return of(undefined);
            }),
            take(1)
        ).subscribe(content => {
            this.emitFileContent(content);
        })
    }

    private readFile(files: FileList | undefined | null) {
        if (files === undefined || files === null || files.length === 0) {
            return;
        }
        this._fileReaderService.readFile(files[0]).pipe(take(1)).subscribe(content => {
            this.emitFileContent(content);
        });
    }

    private emitFileContent(content: string | undefined) {
        if (content === undefined) {
            return;
        }
        this.fileContent.emit(content);
    }

    private draw() {
        if (this.drawingArea === undefined) {
            console.debug('drawing area not ready yet')
            return;
        }
        this.setDrawingAreaHeight(this.drawingAreaHeight, 100);

        this._markedEdges = [];

        this.clearDrawingArea();

        this._svgArrowService.appendArrowMarker(this.drawingArea.nativeElement);

        this.dropLines();
        this._petriNet?.handleBaseCases();
        try {
            const petriGraph = this._petriNet!.getSVGRepresentation();
            for (const node of petriGraph) {
                if (!this.isDFGinNet) {
                    this.isDFGinNet = true;
                }
                this.drawingArea.nativeElement.prepend(node);
            }
        } catch (error) {
            console.log('net not initialized yet', error)
        }

        this.setSelectedEventLog(this._selectedEventLog)
        // Netz nur herunterladbar, wenn fertig
        this.isPetriNetFinished = this._petriNet!.finished;
    }

    private drawResetZoom(): void {
        this.draw();
        this.resetZoomObject(true);
    }

    private drawKeepZoom() {
        this.draw()
        this.resetZoomObjectKeepZoomLevel();
    }

    public dropLines() {
        const lines = Array.from(this.drawingArea!.nativeElement.getElementsByTagName('line'));
        lines.forEach(line => line.parentNode?.removeChild(line));
    }

    private clearDrawingArea() {
        const drawingArea = this.drawingArea?.nativeElement;
        if (drawingArea?.childElementCount === undefined) {
            return;
        }

        while (drawingArea.childElementCount > 0) {
            drawingArea.removeChild(drawingArea.lastChild as ChildNode);
        }
    }

    public processMouseDown(e: MouseEvent) {
        if (e.button === 0 && this.drawingArea) {
            e.stopImmediatePropagation()
            this._leftMouseDown = true;
            const targetEventLog = this.isDomEventInEventLog(e);
            if (targetEventLog) {
                this.removeAllDrawnLines();
                const { x, y } = this.calculateSvgCoordinates(e);
                this.drawingArea.nativeElement.appendChild(this._svgService.createDrawnLine(x, y));
                const newEL = this._petriNet?.getEventLogByID(targetEventLog.getAttribute('id') || '');
                if (newEL) {
                    this.setSelectedEventLog(newEL);
                }
            } else {
                this.setSelectedEventLog();
            }
        }
    }

    public isDomEventInEventLog(e: Event) {
        let target = e.target;
        while (target) {
            if (target instanceof SVGElement) {
                if (target.classList.contains('canvas')) {
                    return false;
                } else {
                    if (target.classList.contains('eventLog')) {
                        return target;
                    }
                    target = target.parentNode;
                }
            }
        }
        return undefined;
    }

    private calculateSvgCoordinates(e: MouseEvent) {
        const svgRect = this.drawingArea!.nativeElement.getBoundingClientRect();
        const x = e.clientX - svgRect.left;
        const y = e.clientY - svgRect.top;
        return { x, y };
    }

    public processMouseUp(e: MouseEvent) {
        if (e.button === 0) {
            this._leftMouseDown = false;
            const drawnLine = this.drawingArea?.nativeElement.getElementsByClassName('drawn-line')[0] as SVGLineElement;
            let intersectionAndChange = false;
            if (drawnLine) {
                const allLines = this.getAllLines();
                const intersectingLines = allLines.filter(line => this.linesIntersect(drawnLine, line));
                for (const line of intersectingLines) {
                    if (!this.isInEventLog(line)) {
                        console.warn("Line is not in the same event log");
                        continue;
                    }
                    line.classList.add('selectedEdge');
                    if (this._markedEdges.indexOf(line) === -1) {
                        this._markedEdges.push(line);
                        intersectionAndChange = true;
                    }
                }
            }
            if (intersectionAndChange) {
                if (!this.customMode) {
                    // Calculate score per stage depending on time in stage --> Then push in List
                    // BEFORE the cut is performed, because that finishes the Petrinet, which in return summarizes the game (before adding the last stage time/score) 
                    this.recordLap();
                    this.stageScore.push(this.calculateExponentialScoreMs(this.stageTimes[this.stageTimes.length - 1]));
                }
                this.performCut(this.confirmCut);
            }
            this.removeAllDrawnLines();
        }
    }

    private isInEventLog(line: SVGLineElement): boolean {
        const eventLogID = line.parentElement?.getAttribute('id');
        if (eventLogID && eventLogID.startsWith('eventLogNumber')) {
            return this._selectedEventLog === this._petriNet?.getEventLogByID(eventLogID);
        }
        return false;
    }

    private getAllLines(): SVGLineElement[] {
        return Array.from(this.drawingArea?.nativeElement.getElementsByTagName('line') || []) as SVGLineElement[];
    }

    private linesIntersect(line1: SVGLineElement, line2: SVGLineElement): boolean {
        // Get the transformed score for each line
        const p1Line1 = this._intersectionCalculatorService.getAbsolutePoint(line1, 'x1', 'y1');
        const p2Line1 = this._intersectionCalculatorService.getAbsolutePoint(line1, 'x2', 'y2');
        const p1Line2 = this._intersectionCalculatorService.getAbsolutePoint(line2, 'x1', 'y1');
        const p2Line2 = this._intersectionCalculatorService.getAbsolutePoint(line2, 'x2', 'y2');

        return this._intersectionCalculatorService.calculateLineIntersection(
            p1Line1.x, p1Line1.y, p2Line1.x, p2Line1.y,
            p1Line2.x, p1Line2.y, p2Line2.x, p2Line2.y
        ) !== null;
    }

    private removeAllDrawnLines() {
        let lines = this.drawingArea?.nativeElement.getElementsByClassName('drawn-line');
        if (!lines) {
            return;
        }
        // need to save number of lines before removing them, because the collection gets smaller when removing
        const numberLines = lines.length;
        for (let i = 0; i < numberLines; i++) {
            lines[i].remove();
        }
    }

    public processMouseMove(e: MouseEvent) {
        if (this._leftMouseDown) {
            const line = this.drawingArea?.nativeElement.getElementsByClassName('drawn-line')[0];
            if (!line) {
                return;
            }
            const { x, y } = this.calculateSvgCoordinates(e);
            line.setAttribute('x2', x.toString());
            line.setAttribute('y2', y.toString());
        }
    }

    private setSelectedEventLog(eventLog?: EventLog) {
        if (eventLog) {
            if (eventLog !== this._previouslySelected && eventLog !== this._selectedEventLog) {
                this.resetCut();
            }
            this._selectedEventLog = eventLog;
            this._previouslySelected = undefined;
            this._petriNet!.selectDFG(this._selectedEventLog!);
        } else {
            if (this._selectedEventLog) {
                this._previouslySelected = this._selectedEventLog;
            }
            this._selectedEventLog = undefined;
            this._petriNet!.selectDFG();
        }
    }

    public get selectedEventLog() {
        return this._selectedEventLog;
    }

    public resetDFGNodeHighlighting() {
        this._petriNet!.removeHighlightingFromEventLogDFGNodes();
    }

    public resetCut() {
        if (this.noDFGinNet()) return;
        if (this.netFinishedSnackbar()) return;
        this.resetDFGNodeHighlighting();
        this._markedEdges.forEach(edge => {
            edge.classList.remove('selectedEdge');
        });
        this._markedEdges = [];
        this.setSelectedEventLog();
    }

    public performCut(applyResultToPetriNet: boolean) {
        if (this.noDFGinNet()) return;
        if (this.netFinishedSnackbar()) return;
        if (this._markedEdges.length === 0) { //if any edge is marked, an event log is or was selected
            this._snackbar.open('No edges marked', 'Close', {
                duration: 3000,
            })
            return;
        }

        const markedEdges: Edge[] = []
        for (const edge of this._markedEdges) {
            const from = edge.getAttribute('from')
            const to = edge.getAttribute('to')
            if (from === null || to === null) {
                console.log('from or to is null', edge)
                continue;
            }

            markedEdges.push(new Edge(new DFGElement(new TraceEvent(from)), new DFGElement(new TraceEvent(to))));
        }
        console.log('markedEdges: ', markedEdges)

        let eventLogToCutIn;
        if (this._selectedEventLog) {
            eventLogToCutIn = this._selectedEventLog;
        } else {
            eventLogToCutIn = this._previouslySelected;
        }

        if (applyResultToPetriNet) {
            try {
                const result = this._inductiveMinerService.applyInductiveMiner(eventLogToCutIn!, markedEdges);
                console.log('cut result: ', result);
                this._petriNet?.handleCutResult(result.cutMade, eventLogToCutIn!, result.el[0], result.el[1])
                this.drawResetZoom();

                this._snackbar.open(`Executed ${result.cutMade} Cut`, 'Close', {
                    duration: 3000,
                })

            } catch (Error) {
                console.log('no cut possible', Error);
                this._snackbar.open('No Cut possible', 'Close', {
                    duration: 3000,
                })
            }
        } else {
            try { // always an eventlog selected
                const result = this._inductiveMinerService.applyInductiveMiner(this._selectedEventLog!, markedEdges);
                this._petriNet?.highlightSubsetInDFG(this._selectedEventLog!, result.el[0]);
            } catch (Error) {
                this.resetDFGNodeHighlighting();
            }
        }
    }

    public applyFallThrough() {
        if (this.noDFGinNet()) return;
        if (this.netFinishedSnackbar()) return;
        if (this._selectedEventLog === undefined) {
            this._snackbar.open('No eventlog marked', 'Close', {
                duration: 3000,
            })
            return;
        }

        // Prüfe, ob ein Cut möglich ist
        const cutResult = this._inductiveMinerService.checkInductiveMiner(this._selectedEventLog);
        if (cutResult) {
            this._snackbar.open(`No Fall Through possible. Possible cut: ${cutResult}`, 'Close', {
                duration: 3000,
            })
            return;
        }

        let result: EventLog[] = [];
        result = this._fallThroughService.getActivityOncePerTrace(this._selectedEventLog);
        if (result.length != 0) { // ActivityOncePerTrace erfolgreich
            this._petriNet?.handleActivityOncePerTraceFallThrough(this._selectedEventLog, result[0], result[1])
            this._snackbar.open(`ActivityOncePerTrace Fall Through applied`, 'Close', {
                duration: 3000,
            })
        } else { // Flower Model
            result = this._fallThroughService.getFlowerModel(this._selectedEventLog);
            this._petriNet?.handleFlowerModelFallThrough(this._selectedEventLog, result)
            this._snackbar.open(`Flower Model Fall Through applied`, 'Close', {
                duration: 3000,
            })
        }

        this.drawResetZoom();
        return;
    }

    downloadPetriNet(type: string) {
        if (this.noDFGinNet()) return;
        if (!this.isPetriNetFinished) {
            this._snackbar.open('Petri net not finished yet', 'Close', {
                duration: 3000,
            })
            return;
        }
        const link = document.createElement('a');
        let content = 'type didn\'t match available export format';
        if (type === 'pnml') {
            content = this._pnmlWriterService.createPnmlForPetriNet(this._petriNet!);
            link.download = 'output.pnml';
        } else if (type === 'json') {
            content = this._pnmlWriterService.createJSONForPetriNet(this._petriNet!);
            link.download = 'output.json';
        }
        const blob = new Blob([content]);
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    private applyZoom(): void {
        // nothing to zoom if there is no graphic yet
        if (!this.drawingArea?.nativeElement.children.length) {
            return;
        }

        this.zoomInstance = svgPanZoom(this.drawingArea.nativeElement, {
            panEnabled: true,
            zoomEnabled: true,
            dblClickZoomEnabled: false,
            mouseWheelZoomEnabled: true,
            preventMouseEventsDefault: true,
            zoomScaleSensitivity: 0.2,
            minZoom: 0.5,
            maxZoom: 10,
            fit: true,
            center: true,
        });
    }

    private resetZoomObject(recreate = false): void {
        if (this.zoomInstance) {
            try { this.zoomInstance.destroy(); } catch { /* ignore */ }
            this.zoomInstance = undefined;
        }
        if (recreate) {
            // will only succeed if SVG is not empty
            this.applyZoom();
        }
    }

    private resetZoomObjectKeepZoomLevel() {
        if (this.zoomInstance != undefined) {
            // Store the current zoom and pan state before redrawing
            let zoomLevel = this.zoomInstance.getZoom();
            let pan = this.zoomInstance.getPan();
            try {
                this.zoomInstance.destroy();
            } catch (Error) {
                console.log("error occured " + Error)
            }
            this.applyZoom();
            // Restore the zoom and pan state after redrawing
            this.zoomInstance.zoom(zoomLevel);
            this.zoomInstance.pan(pan);
        }
    }
}