import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ExampleButtonComponent} from "../example-button/example-button.component";
import {FormsModule} from "@angular/forms";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-event-log-input',
    templateUrl: './event-log-input.component.html',
    standalone: true,
    imports: [
        ExampleButtonComponent,
        FormsModule,
        CdkTextareaAutosize,
        MatFormField,
        MatButtonModule,
        MatInput,
        MatLabel
    ],
    styleUrl: './event-log-input.component.css'
})
export class EventLogInputComponent {
    inputEventLog = ''

    @Output() eventLogChange = new EventEmitter<string>();

    onButtonClicked() {
        if (this.inputEventLog !== '') {
            this.eventLogChange.emit(this.inputEventLog);
        }
    }

    
}
