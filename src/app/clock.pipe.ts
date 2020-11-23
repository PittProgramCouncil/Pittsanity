import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clock'
})
export class ClockPipe implements PipeTransform {

	transform(value: string): string
	{
		var totalSeconds = parseInt(value);
		
		if(totalSeconds < 0)
		{
			return "";
		}

		var minutes = 0;
		var seconds = totalSeconds;
		
		minutes = Math.trunc(seconds / 60);
		seconds = seconds % 60;

		if(seconds < 10)
		{
			return minutes + ":0" + seconds;
		}
		else
		{
			return minutes + ":" + seconds;
		}
	}
}
