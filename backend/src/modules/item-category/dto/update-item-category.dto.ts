import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateItemCategoryDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
