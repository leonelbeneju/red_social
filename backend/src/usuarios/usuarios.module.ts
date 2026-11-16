import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { Usuario, usuarioShema } from './entities/usuario.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service';
import { Publicacion, PublicacionSchema } from '../publicaciones/entities/publicacion.entity';

@Module({
  imports: [
      MongooseModule.forFeature([
      {name: 'Usuario', schema: usuarioShema},
      {name: Publicacion.name , schema : PublicacionSchema},
    ]),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService]
})
export class UsuariosModule {}
