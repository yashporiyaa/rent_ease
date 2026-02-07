import { IsArray, IsDateString, IsNumber, IsString } from "class-validator";

export class CreateRentalDto {
  @IsString()
  customerId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  items: {
    itemId: string;
    quantity: number;
    price: number;
  }[];
}