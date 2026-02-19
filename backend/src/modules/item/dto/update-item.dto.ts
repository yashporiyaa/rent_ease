import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateItemDto {
  @IsString()
  @IsOptional()
  shortName?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  sizeId?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsDateString()
  @IsOptional()
  entryDate?: string;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
