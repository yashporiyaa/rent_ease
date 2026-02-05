import { IsOptional, IsString } from "class-validator";

export class OnboardingBusinessDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
