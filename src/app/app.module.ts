import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {DisplayComponent} from './components/display/display.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FooterComponent} from './components/footer/footer.component';
import {ExampleFileComponent} from './components/example-file/example-file.component';
import {APP_BASE_HREF, PlatformLocation} from "@angular/common";
import {provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {EventLogInputComponent} from "./components/event-log-input/event-log-input.component";
import { MatSelectModule } from '@angular/material/select';
import { EventLogDisplayComponent } from './components/event-log-display/event-log-display.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import Lara from '@primeng/themes/lara';
import { ProgressBarModule  } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { GameTimerComponent } from './components/game-timer/game-timer';
import { DifficultyScreenComponent } from './components/difficulty-screen/difficulty-screen';
import { LevelProgressComponent } from './components/level-progress/level-progress.component';

@NgModule({
    declarations: [
        AppComponent,
        DisplayComponent,
        FooterComponent,
        ExampleFileComponent,
    ],
    bootstrap: [AppComponent], 
    imports: [BrowserModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        ReactiveFormsModule, 
        EventLogInputComponent, 
        EventLogDisplayComponent,
        FormsModule,
        MatSlideToggleModule,
        ProgressBarModule,
        RadioButtonModule,
        MatSnackBarModule,
        GameTimerComponent,
        DifficultyScreenComponent,
        LevelProgressComponent
    ],
    exports: [ ],
    providers: [
        {
            provide: APP_BASE_HREF,
            useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
            deps: [PlatformLocation]
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
              preset: Lara,
              options: {
                darkModeSelector: false || 'none'
            }
            }
            
            
          })
    ]
})
export class AppModule {
}
