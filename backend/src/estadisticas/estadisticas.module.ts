import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';

import { Publicacion, PublicacionSchema } from '../publicaciones/entities/publicacion.entity';

import { Usuario, usuarioShema } from '../usuarios/entities/usuario.entity';

import { AuthGuard } from '../autenticacion/guards/auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Usuario.name, schema: usuarioShema }
    ])
  ],
  controllers: [EstadisticasController],
  providers: [EstadisticasService, AuthGuard],
})
export class EstadisticasModule {}