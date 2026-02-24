import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReturnQueryDto {
  @IsOptional()
  @IsString()
  rentalId?: string;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsIn(['all', 'returned'])
  status?: 'all' | 'returned';
}
