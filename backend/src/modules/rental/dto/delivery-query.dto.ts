import { IsIn, IsOptional, IsString } from 'class-validator';

export class DeliveryQueryDto {
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
  @IsIn(['all', 'picked', 'pending'])
  status?: 'all' | 'picked' | 'pending';
}
