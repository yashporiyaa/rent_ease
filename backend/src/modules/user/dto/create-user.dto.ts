import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  businessType: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  address: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}