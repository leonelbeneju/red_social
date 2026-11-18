import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  apellido: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  usuario: string;

  @Prop({ required: true, select: false })
  clave: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ default: '', maxlength: 250 })
  descripcion: string;

  @Prop({ default: null })
  imagen: string;

  @Prop({
    type: String,
    enum: ['usuario', 'administrador'],
    default: 'usuario',
  })
  perfil: string;

  @Prop({ type: Boolean, default: true })
  activo: boolean;
}

export type UsuarioDocument = HydratedDocument<Usuario>;

export const usuarioShema = SchemaFactory.createForClass(Usuario);
