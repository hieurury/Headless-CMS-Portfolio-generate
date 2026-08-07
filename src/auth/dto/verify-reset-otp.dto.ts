import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyResetOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
  code: string;
}
