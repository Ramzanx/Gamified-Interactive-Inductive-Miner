import { BehaviorSubject, Observable } from 'rxjs';
import { InductivePetriNet } from '../classes/Datastructure/InductiveGraph/inductivePetriNet';
import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DisplayService implements OnDestroy {
    private _petriNet$: BehaviorSubject<InductivePetriNet>;

    constructor() {
        this._petriNet$ = new BehaviorSubject<InductivePetriNet>(new InductivePetriNet());
    }

    ngOnDestroy(): void {
        this._petriNet$.complete();
    }

    public get InductivePetriNet$(): Observable<InductivePetriNet> {
        return this._petriNet$.asObservable();
    }

    public get InductivePetriNet(): InductivePetriNet {
        return this._petriNet$.getValue();
    }

    public display(petriNet: InductivePetriNet) {
        this._petriNet$.next(petriNet);
    }
}