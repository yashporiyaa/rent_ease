import { IsOptional, IsString } from 'class-validator';

export class RentalPaymentCustomerQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
