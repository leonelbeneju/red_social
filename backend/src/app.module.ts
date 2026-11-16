import { Module} from '@nestjs/common';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';




@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
    }),
    MongooseModule.forRoot(process.env.CONNECTION_STRING!),
    PublicacionesModule,
    AutenticacionModule,
    UsuariosModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
