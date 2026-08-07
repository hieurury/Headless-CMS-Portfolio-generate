import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  /** Short-lived JWT issued after OTP verification */
  @IsString()
  resetToken: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(72, { message: 'Password must be at most 72 characters long' })
  password: string;
}
