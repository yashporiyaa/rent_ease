import { IsNumber, Min, Max } from 'class-validator';

export class UpdateTaxDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate: number;
}
