import { Component, OnInit } from '@angular/core';

import { FactListComponent } from '../fact-list/fact-list.component';
import { EventFlagsService } from '../event-flags.service';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css']
})
export class ControlPanelComponent implements OnInit {

	constructor(private eventFlagsService: EventFlagsService) { }

	ngOnInit(): void {
	}
	
	startNextRound()
	{
		this.eventFlagsService.nextRoundFlag = true;
	}
	
	startNextGroup()
	{
		this.eventFlagsService.nextGroupFlag = true;
	}
	
	checkAnswers()
	{
		this.eventFlagsService.checkAnswersFlag = true;
	}

}
