import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class EventFlagsService {
	nextRoundFlag: boolean = false;
	nextGroupFlag: boolean = false;
	checkAnswersFlag: boolean = false;
	playRotationsFlag: boolean = false;
	
	constructor() { }
}
