import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;
}