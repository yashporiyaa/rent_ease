import { IsNumber, IsString } from 'class-validator';

export class CreateItemDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsNumber()
  price: number;
}
