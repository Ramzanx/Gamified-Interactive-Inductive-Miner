import { Component, Input } from '@angular/core';
import { ExampleFileComponent } from '../example-file/example-file.component';
import { CommonModule } from '@angular/common';
import { EventLogDisplayComponent } from '../event-log-display/event-log-display.component';
import { EventLog } from 'src/app/classes/Datastructure/event-log/event-log';
import { EventLogInputComponent } from '../event-log-input/event-log-input.component';
import { DisplayService } from 'src/app/services/display.service';
import { TextParserService } from 'src/app/services/text-parser.service';
import { InductivePetriNet } from 'src/app/classes/Datastructure/InductiveGraph/inductivePetriNet';

@Component({
  selector: 'custom-inputs',
  standalone: true,
  imports: [
    CommonModule,
    ExampleFileComponent,
    EventLogDisplayComponent,
    EventLogInputComponent
  ],
  templateUrl: './custom-inputs.component.html',
  styleUrl: './custom-inputs.component.css'
})
export class CustomInputsComponent {

  constructor(
    private _displayService: DisplayService,
    private _textParserService: TextParserService) {
  }

  @Input() selectedEventLog?: EventLog;

  updateSelectedEventLog(eventLog: any): void {
    this.selectedEventLog = eventLog;
  }

  parseEventLog(newEventLog: string): void {
    const result = this._textParserService.parse(newEventLog);
    if (result) {
      this._displayService.display(new InductivePetriNet().init(result));
    }
  }
}