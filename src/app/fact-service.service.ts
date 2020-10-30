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
		if(this.curRound >= 0)
		{
			return this.game["" + this.curGroup]["" + this.curRound];
		}
		else
		{
			return [];
		}
	}
	
	getCurTitle()
	{
		if(this.curGroup >= 0)
		{
			return this.game["" + this.curGroup]["title"];
		}
		else
		{
			return "GAME OVER";
		}
	}
	
	incrementRound()
	{
		if(this.curRound != 2 && this.curRound >= 0)
		{
			this.curRound++;
		}
	}
	
	incrementGroup()
	{
		if(this.curGroup != Object.keys(this.game).length - 1 && this.curGroup >= 0)
		{
			this.curGroup++;
			this.curRound = 0;
		}
		else
		{
			this.curGroup = -1;
			this.curRound = -1;
		}
	}
}
