import { Injectable } from '@angular/core';

import game from "./game.json";

@Injectable({
  providedIn: 'root'
})
export class FactService {
	
	//Ideally this would read from an external JSON file, but in Angular
	//that requires importing httpclient, and I didn't feel like dealing 
	//with that.
	private game = game;
	
	private curGroup = 0;
	private curRound = 0;
				
	constructor() { }
	
	//getCurRoundFacts returns an array of objects of the form { fact, value }
	getCurRoundFacts()
	{
		return this.game["" + this.curGroup]["" + this.curRound];
	}
	
	getCurTitle()
	{
		return this.game["" + this.curGroup]["title"];
	}
	
	incrementRound()
	{
		if(this.curRound != 2)
		{
			this.curRound++;
		}
	}
	
	incrementGroup()
	{
		if(this.curGroup != Object.keys(this.game).length)
		{
			this.curGroup++;
			this.curRound = 0;
		}
	}
}
