import { IsBoolean, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateCredentialsDto {
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[0-9]/, { message: 'Password must contain at least 1 number' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least 1 capital letter' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password must contain at least 1 special character' })
  newPassword?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'PIN must be exactly 4 digits' })
  newPin?: string;

  @IsOptional()
  @IsBoolean()
  pinEnabled?: boolean;
}
