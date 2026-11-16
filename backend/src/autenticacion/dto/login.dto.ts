import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  clave: string;
}
