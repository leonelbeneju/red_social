import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';

export class UpdateComentarioDto {

  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @Matches(/\S/, {
    message: 'El comentario no puede contener solamente espacios',
  })
  @MaxLength(1000, {
    message: 'El comentario no puede superar los 1000 caracteres',
  })
  mensaje: string;
}