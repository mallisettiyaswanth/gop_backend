import { IsEmail } from 'class-validator';

export class LoginMethodDto {
  @IsEmail()
  email!: string;
}
