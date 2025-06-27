import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DisplayService } from './services/display.service';
import { XmlParserService } from './services/xml-parser.service';
import { TextParserService } from "./services/text-parser.service";
import { InductivePetriNet } from './classes/Datastructure/InductiveGraph/inductivePetriNet';
import { EventLog } from './classes/Datastructure/event-log/event-log';
import {
    trigger,
    style,
    animate,
    transition,
  } from '@angular/animations';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    @Input() selectedEventLog?: EventLog;

    public textareaFc: FormControl;
    public initHidden: boolean = false;

    constructor(
        private _xmlParserService: XmlParserService,
        private _displayService: DisplayService,
        private _textParserService: TextParserService) 
    {
        this.textareaFc = new FormControl();
        this.textareaFc.disable();
    }

    updateSelectedEventLog(eventLog: any): void {
        this.selectedEventLog = eventLog;
    }

    public processSourceChange(newSource: string) {
        this.textareaFc.setValue(newSource);

        const result = this._xmlParserService.parseXml(newSource)
        if (result !== undefined) {
            this._displayService.display(new InductivePetriNet().init(result));
        }
    }

    parseEventLog(newEventLog: string): void {
        const result = this._textParserService.parse(newEventLog);
        if (result) {
            this._displayService.display(new InductivePetriNet().init(result));
        }
    }
}
