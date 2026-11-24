import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Usuario, usuarioShema } from '../usuarios/entities/usuario.entity';
import { AutenticacionService } from './autenticacion.service';
import { AutenticacionController } from './autenticacion.controller';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    ConfigModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2m' },
      }),
    }),

    MongooseModule.forFeature([
      { name: Usuario.name, schema: usuarioShema },
    ]),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService, AuthGuard],
})
export class AutenticacionModule {}