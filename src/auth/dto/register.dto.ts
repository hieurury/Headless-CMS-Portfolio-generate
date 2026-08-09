import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(72, { message: 'Password must be at most 72 characters long' })
  password: string;

  /**
   * Public username — used as the URL identifier (/:username/...)
   * Rules: 3–30 chars, lowercase a-z, 0-9, hyphens and underscores allowed,
   * must start with a letter or digit.
   */
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(30, { message: 'Username must be at most 30 characters' })
  @Matches(/^[a-z0-9][a-z0-9_-]{2,29}$/, {
    message: 'Username must start with a letter or digit and contain only a-z, 0-9, - or _',
  })
  username: string;
}
