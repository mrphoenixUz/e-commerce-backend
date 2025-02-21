import { IsNotEmpty, IsEmail } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  first_name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}