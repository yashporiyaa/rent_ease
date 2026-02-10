import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  invoiceId: string;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsDateString()
  paidAt: string;
}
