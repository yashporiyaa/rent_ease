import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateItemSizeDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;
}
