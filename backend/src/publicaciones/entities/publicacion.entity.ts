import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Comentario, ComentarioSchema } from './comentario.entity';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true })
export class Publicacion {

  @Prop({ required: true, trim: true, maxLength: 100 })
  titulo: string;

  @Prop({ required: true, trim: true, maxLength: 2000 })
  mensaje: string;

  @Prop({ type: String, default: null })
  imagen: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autor: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  reacciones: Types.ObjectId[];

  @Prop({ default: true })
  activo: boolean;
  
  @Prop({ type: [ComentarioSchema], default: [] })
  comentarios: Comentario[];
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
