import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comentario {

  @Prop({ required: true, trim: true, maxlength: 1000 })
  mensaje: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autor: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  modificado: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);