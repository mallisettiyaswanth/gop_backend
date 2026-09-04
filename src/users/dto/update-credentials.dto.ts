import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateCredentialsDto {
  @IsString()
  currentPassword!: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'PIN must be exactly 4 digits' })
  newPin?: string;
}
