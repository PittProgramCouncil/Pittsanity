import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { FactListComponent } from './fact-list/fact-list.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { ClockPipe } from './clock.pipe';

@NgModule({
  declarations: [
    AppComponent,
    FactListComponent,
    ControlPanelComponent,
    ClockPipe
  ],
  imports: [
    BrowserModule,
	DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
