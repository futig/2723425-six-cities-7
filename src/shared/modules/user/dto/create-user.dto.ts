import { IsEmail, IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';
import { UserType, UserTypes } from '../../../types/index.js';

export class CreateUserDto {
  @IsString()
  @Length(1, 15)
  public name!: string;

  @IsEmail()
  public email!: string;

  @IsOptional()
  @IsString()
  @Matches(/\.(jpe?g|png)$/i)
  public avatarPath?: string;

  @IsString()
  @Length(6, 12)
  public password!: string;

  @IsIn([...UserTypes])
  public type!: UserType;
}
