import {
  IsArray,
  IsDateString,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RentalItemDto {
  @IsString()
  itemId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  rate: number;

  @IsDateString()
  fromAt: string;

  @IsDateString()
  toAt: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  discountPercent?: number;

  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @IsNumber()
  @IsOptional()
  taxPercent?: number;

  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @IsNumber()
  total: number;

  @IsString()
  @IsOptional()
  status?: string;
}

export class CreateRentalDto {
  @IsString()
  customerId: string;

  @IsNumberString()
  @IsOptional()
  bookingNo?: string;

  @IsDateString()
  bookingAt: string;

  @IsString()
  deliveryAddress: string;

  @IsNumber()
  totalQuantity: number;

  @IsNumber()
  discountPercent: number;

  @IsNumber()
  discountAmount: number;

  @IsNumber()
  taxPercent: number;

  @IsNumber()
  taxAmountValue: number;

  @IsNumber()
  totalAmount: number;

  @IsNumber()
  advanceAmount: number;

  @IsNumber()
  pendingAmount: number;

  @IsNumber()
  depositAmount: number;

  @IsNumber()
  outstandingWithDeposit: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RentalItemDto)
  lineItems: RentalItemDto[];
}
