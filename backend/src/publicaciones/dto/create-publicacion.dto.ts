import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePublicacionDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  mensaje: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imagen?: string;
}