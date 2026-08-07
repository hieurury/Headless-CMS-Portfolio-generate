import { IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  userId: string;

  @IsString()
  @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
  code: string;
}
