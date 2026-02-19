import { IsNotEmpty, IsString } from 'class-validator';

export class CreateItemSizeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
