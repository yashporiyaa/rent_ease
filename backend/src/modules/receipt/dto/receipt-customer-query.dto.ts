import { IsOptional, IsString } from 'class-validator';

export class ReceiptCustomerQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
