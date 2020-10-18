import { Component, OnInit } from '@angular/core';

import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

import { FactService } from '../fact-service.service';
import { EventFlagsService } from '../event-flags.service';

@Component({
  selector: 'app-fact-list',
  templateUrl: './fact-list.component.html',
  styleUrls: ['./fact-list.component.css']
})
export class FactListComponent implements OnInit {

	newFacts = [];
	finalFacts = [];
	revealValues = false;
	title = "";

  
	constructor(private factService: FactService, private eventFlagsService: EventFlagsService) { }

	ngOnInit(): void {
		this.newFacts = this.factService.getCurRoundFacts();
		this.title = this.factService.getCurTitle();
	}
	
	ngDoCheck()
	{
		if(this.eventFlagsService.nextRoundFlag == true)
		{
			//If the player did not put all of the round's fact onto the board, the next round shall not start.
			if(this.newFacts.length == 0)
			{
				this.getNextRoundFacts();
			}
		
			this.eventFlagsService.nextRoundFlag = false;
		}
		
		if(this.eventFlagsService.nextGroupFlag == true)
		{
			//The next group may be started at any time (for now).
			this.finalFacts = [];
			this.getNextGroup();
			this.eventFlagsService.nextGroupFlag = false;
		}
		
		if(this.eventFlagsService.checkAnswersFlag == true)
		{
			this.checkValues();
			this.eventFlagsService.checkAnswersFlag = false;
		}
	}

	drop(event: CdkDragDrop<String[]>) 
	{
		if (event.previousContainer === event.container) 
		{
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		} 
		else 
		{
			transferArrayItem(event.previousContainer.data,
							event.container.data,
							event.previousIndex,
							event.currentIndex);
		}
	}
	
	getNextRoundFacts()
	{
		this.factService.incrementRound();
		this.newFacts = this.factService.getCurRoundFacts();
	}
	
	getNextGroup()
	{
		this.factService.incrementGroup();
		this.newFacts = this.factService.getCurRoundFacts();
		
		this.title = this.factService.getCurTitle();
	}
	
	
	//checkValues returns true if the facts in this.finalFacts are in order, with higher number values at the top.
	//checkValues also flips the value of this.revealValues, which will reveal or hide the number values of each fact.
	checkValues() : boolean
	{
		this.revealValues = !this.revealValues;
		
		var win = true;
		
		//Check to see if this.finalFacts has no inversions. finalFacts[0] corresponds to the topmost fact
		//as displayed on the webpage, so you have to check that the array is in decreasing order.
		for(var i = 0; i < this.finalFacts.length - 1; ++i)
		{
			if(this.finalFacts[i].value < this.finalFacts[i + 1].value)
			{
				win = false;
				break;
			}
		}
		
		if(win) { console.log("YOU WIN"); }
		else { console.log("YOU LOSE"); }
		
		return win;
	}
}
