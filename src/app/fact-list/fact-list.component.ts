import password from "../password.json";
import { Component } from '@angular/core';

import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

import { FactService } from '../fact-service.service';
import { EventFlagsService } from '../event-flags.service';
import { timer } from 'rxjs';
import { ClockPipe } from '../clock.pipe';

@Component({
  selector: 'app-fact-list',
  templateUrl: './fact-list.component.html',
  styleUrls: ['./fact-list.component.css']
})
export class FactListComponent {
	private password = password;
	isTitleScreen = true;
	newFacts = [];
	finalFacts = [];
	title = "";
	curRound = -1;
	curGroup = -2;
	
	/*	numMistakes: The length of numMistakes keeps track of how many times the current group has put the facts in 
	*	the incorrect order. This has to be an array because it is used to create elements in fact-list.component.html
	*	via an *ngFor loop, which only iterates over collections and doesn't just simply take numbers for whatever reason.
	*/
	numMistakes = [];
	
	/*	roundWon: Keeps track of whether or not the player has put the facts correctly in descending order.
	/	Used to decide which animation to play when reseting the background color when proceeding to the next
	/	round or group.
	/
	/	-1: neutral, no data (used as initial value at the start of each new group since there is no previous round)
	/	0: facts were put in wrong order
	/	1: facts were put in correct order
	*/
	roundWon = -1;
	
	/*	correctOrder: Because roundWon is set to -1 every time the background animation is reset, another boolean is needed
	*	to disable the nextRound button until the facts are placed in the correct order. The fact that I need this variable in 
	*	the first place shows how unelegant this code is, but finals week is killing me.
	*/
	correctOrder = true;
	
	timeRemaining = -1;
	clockSpeed = 0;
	interval;
	subscribeTimer: any;

  
	constructor(private factService: FactService, private eventFlagsService: EventFlagsService) 
	{ 
		this.setUpTimer();
	}
	
	ngDoCheck()
	{
		var animated_elements = Array.from(document.getElementsByClassName("finalFactBox") as HTMLCollectionOf<HTMLElement>);
		
		//Only advance to next round if all of the current round's facts were placed in the correct order,
		//or if it is the pre-round screen where there are no facts
		if(this.eventFlagsService.nextRoundFlag == true && this.correctOrder && this.curRound < 2)
		{
			this.correctOrder = false;
			this.resetLoseBackground();
			
			//If the player did not put all of the round's fact onto the board, the next round shall not start.
			if(this.newFacts.length == 0 && !this.isTitleScreen)
			{
				this.getNextRoundFacts();
				++this.curRound;
			}
			
			//Set time limit based on round number
			switch(this.curRound)
			{
				case 0:
					this.timeRemaining = 90;
					break;
				case 1: 
					this.timeRemaining = 60;
					break;
				case 2:
					this.timeRemaining = 30;
					break;
				default:
					this.timeRemaining = -1;
			}
					
			this.clockSpeed = 0;
		}
		
		if(this.eventFlagsService.nextGroupFlag == true && this.curGroup < 9 && this.curGroup > -2)
		{
			this.resetLoseBackground();
			
			//The next group may be started at any time (for now).
			this.isTitleScreen = false;
			this.correctOrder = true;
			this.roundWon = -1;
			this.curRound = -1;
			this.timeRemaining = -1;
			this.clockSpeed = 0;
			this.numMistakes = [];
			this.newFacts = [];
			this.finalFacts = [];
			this.getNextGroup();
		}
		
		if(this.eventFlagsService.prevGroupFlag == true && this.curGroup > 0)
		{
			this.resetLoseBackground();
			
			this.correctOrder = true;
			this.roundWon = -1;
			this.curRound = -1;
			this.timeRemaining = -1;
			this.numMistakes = [];
			this.newFacts = [];
			this.finalFacts = [];
			this.getPrevGroup();
		}
		
		if(this.eventFlagsService.checkAnswersFlag == true)
		{
			this.roundWon = this.checkValues();
			this.clockSpeed = 0;
		}
		
		if(this.eventFlagsService.startClockFlag == true)
		{
			this.clockSpeed = 1;
		}
		
		if(this.eventFlagsService.pauseClockFlag == true)
		{
			this.clockSpeed = 0;
		}
		
		this.eventFlagsService.clearFlags();
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
		
		this.title = this.factService.getCurTitle();
		this.curGroup++;
	}
	
	getPrevGroup()
	{
		this.factService.decrementGroup();
		
		this.title = this.factService.getCurTitle();
		this.curGroup--;
	}
	
	
	//checkValues returns true if the facts in this.finalFacts are in order, with higher number values at the top.
	checkValues() : number
	{
		//Do nothing if not all of the facts have been placed in finalFacts
		if(this.newFacts.length != 0)
		{
			return -1;
		}
		
		var correct = true;
		
		//this.finalFacts[0] corresponds to the topmost fact as displayed on the webpage, 
		//so you have to check that the array is in decreasing order.
		for(var i = 0; i < this.finalFacts.length; ++i)
		{
			//Check if finalFacts has an inversion. If so, the group that is playing loses.
			if( (i < this.finalFacts.length - 1) && (this.finalFacts[i].value < this.finalFacts[i + 1].value) )
			{
				correct = false;
			}
		}
		
		//Only reveal the fact values if they are in the correct order
		if(correct)
		{
			this.playRevealAnimation();
		}
		else
		{
			this.playLoseAnimation();
		}
		
		if(correct)
		{
			this.correctOrder = true; //I forget if JS equates 1 with true and 0 with false
			return 1;
		}
		else
		{	
			this.correctOrder = false;
			return 0;
		}
	}
	
	playRevealAnimation() : void
	{
		var animated_elements = Array.from(document.getElementsByClassName("answerContainer") as HTMLCollectionOf<HTMLElement>);
		
		for(var i = 0; i < animated_elements.length; ++i)
		{
			animated_elements[i].style.transform = "rotateX(-180deg)";
		}
	}
	
	playLoseAnimation() : void
	{
		var animated_elements = Array.from(document.getElementsByClassName("finalFactBox") as HTMLCollectionOf<HTMLElement>);
		
		for(var i = 0; i < animated_elements.length; ++i)
		{		
			animated_elements[i].style.animation = "lose_colorize 2.0s ease-out forwards";
			animated_elements[i].style.animationDelay = "0.5s";
			animated_elements[i].style.animationPlayState = "running";
		}
	}
	
	resetLoseBackground() : void
	{
		//This function is activated 
		if(this.roundWon != 0)
		{
			return;
		}
		
		var animated_elements = Array.from(document.getElementsByClassName("finalFactBox") as HTMLCollectionOf<HTMLElement>);
		
		if(this.numMistakes.length < 3)
		{
			/* Disabled check marks for 12/5/2021 Pittsanity event */
			//this.numMistakes.push(true);
		}
		
		if(this.numMistakes.length < 3)
		{
			for(var i = 0; i < animated_elements.length; ++i)
			{		
				animated_elements[i].style.animation = "";
				animated_elements[i].style.backgroundColor = "#0092f1";
			}
		}
		else
		{
			this.playRevealAnimation();
		}
		
		this.roundWon = -1;
	}
	
	/* Functions for the round timer */
	observableTimer() 
	{
		const source = timer(1000, 2000);
		const abc = source.subscribe(val => {
			this.subscribeTimer = this.timeRemaining - val;
		});
	}
	
	setUpTimer()
	{
		this.interval = setInterval(() => {
			if(this.timeRemaining > 0)
			{
				this.timeRemaining -= this.clockSpeed;
			}
			else
			{
				//this.timeRemaining = 0;
			}
		},1000)
	}
	
	addTime(time)
	{
		this.timeRemaining += time;
	}
	
	setTime(time)
	{
		this.timeRemaining = time;
	}
	
	checkPassword(pw)
	{
		
		if(pw == this.password["value"])
		{
			this.curGroup++;
		}
	}
}
