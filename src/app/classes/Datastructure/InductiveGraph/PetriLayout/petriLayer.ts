import { BehaviorSubject } from "rxjs";
import { CustomElement } from "../Elements/customElement";
import { CustomArray } from "../../customArray";

export class PetriLayer extends CustomArray<CustomElement>{
    private _minX = 0;
    private _maxX = 0;

    override remove(item: CustomElement) {
        const index = this.findIndex(element => element === item);
        this.splice(index, 1);
    }

    override updateElem(toRemove: CustomElement, toInsert: CustomElement): void {
        const index = this.findIndex(element => element === toRemove);
        this[index] = toInsert;
    }

    public isValueInLayer(xVal: number) {
        return (this.minX < xVal && xVal < this._maxX);
    }

    public get minX() {
        return this._minX;
    }
    public set minX(value) {
        this._minX = value;
    }
    public get maxX() {
        return this._maxX;
    }
    public set maxX(value) {
        this._maxX = value;
    }
}
