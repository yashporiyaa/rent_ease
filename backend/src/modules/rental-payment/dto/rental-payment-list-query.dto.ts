import { IsDateString, IsOptional } from 'class-validator';

export class RentalPaymentListQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
