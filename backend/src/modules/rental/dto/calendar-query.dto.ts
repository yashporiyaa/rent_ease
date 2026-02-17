import { IsDateString } from 'class-validator';

export class CalendarQueryDto {
  @IsDateString()
  start: string;

  @IsDateString()
  end: string;
}
