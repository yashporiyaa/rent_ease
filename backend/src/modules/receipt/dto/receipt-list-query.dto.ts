import { IsDateString, IsOptional } from 'class-validator';

export class ReceiptListQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
