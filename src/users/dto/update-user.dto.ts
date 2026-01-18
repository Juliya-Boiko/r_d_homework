import { IsEmail, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @MinLength(4)
  name: string;

  @IsEmail()
  email: string;
}
