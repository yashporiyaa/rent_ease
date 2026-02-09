import { IsArray, IsDateString, IsString, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class RentalItemDto {
  @IsString()
  itemId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class CreateRentalDto {
  @IsString()
  customerId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RentalItemDto)
  items: RentalItemDto[];
}