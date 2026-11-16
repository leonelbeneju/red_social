import { Module } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { AuthGuard } from '../autenticacion/guards/auth.guard';
import { Publicacion, PublicacionSchema } from './entities/publicacion.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name: Publicacion.name, schema: PublicacionSchema},
    ])
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService, AuthGuard],
})
export class PublicacionesModule {}
