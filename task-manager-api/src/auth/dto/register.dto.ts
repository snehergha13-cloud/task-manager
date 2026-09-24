import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'A valid email is required' })
  email: string;

  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
