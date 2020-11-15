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

	isTitleScreen = true;
	newFacts = [];
	finalFacts = [];
	title = "";
	curGroup = -1;
	
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

  
	constructor(private factService: FactService, private eventFlagsService: EventFlagsService) { }
	
	ngOnInit()
	{
		this.isTitleScreen = true;
		this.newFacts = [];
		this.finalFacts = [];
		this.title = "";
		this.curGroup = -1;
		this.numMistakes = [];
		this.roundWon = -1;
		this.correctOrder = true;
	}
	
	ngDoCheck()
	{
		//Only advance to next round if all of the current round's facts were placed in the correct order,
		//or if it is the pre-round screen where there are no facts
		if(this.eventFlagsService.nextRoundFlag == true && this.correctOrder)
		{
			this.correctOrder = false;
			this.resetWinLoseBackground();
			
			//If the player did not put all of the round's fact onto the board, the next round shall not start.
			if(this.newFacts.length == 0 && !this.isTitleScreen)
			{
				this.getNextRoundFacts();
			}
		
		}
		
		if(this.eventFlagsService.nextGroupFlag == true)
		{
			this.resetWinLoseBackground();
			
			//The next group may be started at any time (for now).
			this.isTitleScreen = false;
			this.correctOrder = true;
			this.roundWon = -1;
			this.numMistakes = [];
			this.finalFacts = [];
			this.getNextGroup();
			
		}
		
		if(this.eventFlagsService.checkAnswersFlag == true)
		{
			this.roundWon = this.checkValues();
			
		}
		
		this.eventFlagsService.nextRoundFlag = false;
		this.eventFlagsService.nextGroupFlag = false;
		this.eventFlagsService.checkAnswersFlag = false;
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
		this.curGroup++;
	}
	
	
	//checkValues returns true if the facts in this.finalFacts are in order, with higher number values at the top.
	//checkValues also flips the value of this.revealValues, which will reveal or hide the number values of each fact.
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
			this.revealAnswers()
		}
		
		this.playRevealAnimation();
		this.playWinLoseAnimation(correct);
		
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
	
	revealAnswers() : void
	{
		for(var i = 0; i < this.finalFacts.length; ++i)
		{
			this.finalFacts[i].revealed = 1;
		}
	}
	
	playRevealAnimation() : void
	{
		var animated_elements = Array.from(document.getElementsByClassName("animated") as HTMLCollectionOf<HTMLElement>);
		
		for(var i = 0; i < animated_elements.length; ++i)
		{
			//For some reason, the element's animationPlayState is an empty string when the page is first loaded.
			if(animated_elements[i].style.animationPlayState == "paused" || animated_elements[i].style.animationPlayState == "")
			{
				animated_elements[i].style.animationPlayState = "running";
			}
			else
			{
				animated_elements[i].style.animationPlayState = "paused";
			}
		}
	}
	
	playWinLoseAnimation(correct) : void
	{
		var animated_elements = Array.from(document.getElementsByClassName("gameBackground") as HTMLCollectionOf<HTMLElement>);
		
		for(var i = 0; i < animated_elements.length; ++i)
		{		
			//For some reason, the element's animationPlayState is an empty string when the page is first loaded.
			if(correct)
			{
				animated_elements[i].style.animation = "win_colorize 2s ease-out forwards";
			}
			else
			{
				animated_elements[i].style.animation = "lose_colorize 2s ease-out forwards";
			}
			
			animated_elements[i].style.animationDelay = "1.5s";
			animated_elements[i].style.animationPlayState = "running";
		}
	}
	
	resetWinLoseBackground() : void
	{
		//No play data, previous round was neither won or lost - do nothing
		if(this.roundWon < 0)
		{
			return;
		}
		
		var animated_elements = Array.from(document.getElementsByClassName("gameBackground") as HTMLCollectionOf<HTMLElement>);
		
		for(var i = 0; i < animated_elements.length; ++i)
		{		
			if(this.roundWon == 1)
			{
				animated_elements[i].style.animation = "win_reset 0.5s ease forwards";
				animated_elements[i].style.animationPlayState = "running";
			}
			else
			{
				this.numMistakes.push(true);
				
				if(this.numMistakes.length == 3)
				{
					this.revealAnswers();
				}
				else
				{
					animated_elements[i].style.animation = "lose_reset 0.5s ease forwards";
					animated_elements[i].style.animationPlayState = "running";
				}
			}	
		}
		
		this.roundWon = -1;
	}
}
