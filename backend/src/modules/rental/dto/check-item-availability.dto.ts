import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckItemAvailabilityDto {
  @IsString()
  itemId: string;

  @IsDateString()
  fromAt: string;

  @IsDateString()
  toAt: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  excludeRentalId?: string;
}
