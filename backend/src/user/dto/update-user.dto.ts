import { IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  readonly email: string;
  @IsString()
  readonly firstName: string;
  @IsString()
  readonly lastName: string;
  readonly roles: Array<string>;
};