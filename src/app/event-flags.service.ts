import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class EventFlagsService {
	nextRoundFlag: boolean = false;
	nextGroupFlag: boolean = false;
	prevGroupFlag: boolean = false;
	checkAnswersFlag: boolean = false;
	
	constructor() { }
	
	clearFlags()
	{
		this.nextRoundFlag = false;
		this.nextGroupFlag = false;
		this.prevGroupFlag = false;
		this.checkAnswersFlag = false;
	}
}
