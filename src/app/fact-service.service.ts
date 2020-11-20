import { Injectable } from '@angular/core';

import game from "./game.json";

@Injectable({
  providedIn: 'root'
})
export class FactService {
	private game = game;
	
	private curGroup = -1;
	private curRound = -1;
				
	constructor() {}
	
	//getCurRoundFacts returns an array of objects of the form { fact, value }
	getCurRoundFacts()
	{
		console.log(this.curRound);
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
			return "";
		}
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
		if(this.curGroup != Object.keys(this.game).length - 1)
		{
			this.curGroup++;
			this.curRound = -1;
		}
	}
	
	decrementGroup()
	{
		if(this.curGroup > 0)
		{
			this.curGroup--;
			this.curRound = -1;
		}
	}
}
