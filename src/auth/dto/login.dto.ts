import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Please provide a valid email or username' })
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
