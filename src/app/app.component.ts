import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DisplayService } from './services/display.service';
import { XmlParserService } from './services/xml-parser.service';
import { InductivePetriNet } from './classes/Datastructure/InductiveGraph/inductivePetriNet';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    public textareaFc: FormControl;
    public initHidden: boolean = false;

    constructor(
        private _xmlParserService: XmlParserService,
        private _displayService: DisplayService,) {
        this.textareaFc = new FormControl();
        this.textareaFc.disable();
    }

    public processSourceChange(newSource: string) {
        this.textareaFc.setValue(newSource);

        const result = this._xmlParserService.parseXml(newSource)
        if (result !== undefined) {
            this._displayService.display(new InductivePetriNet().init(result));
        }
    }
}