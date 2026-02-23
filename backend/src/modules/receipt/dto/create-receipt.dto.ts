import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreateReceiptLineDto {
  @IsString()
  @IsNotEmpty()
  rentalId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  receivedAmount: number;
}

export class CreateReceiptDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsDateString()
  entryDate: string;

  @IsEnum(PaymentMethod)
  paymentMode: PaymentMethod;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptLineDto)
  lineItems: CreateReceiptLineDto[];
}
