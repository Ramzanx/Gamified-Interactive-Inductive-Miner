import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { InductivePetriNet } from '../classes/Datastructure/InductiveGraph/inductivePetriNet';
import { EventLog } from '../classes/Datastructure/event-log/event-log';
import { Trace } from '../classes/Datastructure/event-log/trace';

@Injectable({ providedIn: 'root' })

export class DisplayService {
    private _petriNet$ = new BehaviorSubject<InductivePetriNet | null>(null);

    get InductivePetriNet$(): Observable<InductivePetriNet | null> {
        return this._petriNet$.asObservable();
    }

    get InductivePetriNet(): InductivePetriNet | null {
        return this._petriNet$.value;
    }

    display(petriNet: InductivePetriNet): void {
        this._petriNet$.next(petriNet);
    }

    public clear(): void {
        this._petriNet$.next(null);
    }

    ngOnDestroy(): void {
        this._petriNet$.complete();
    }
}