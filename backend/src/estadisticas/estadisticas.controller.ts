import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { AuthGuard } from '../autenticacion/guards/auth.guard';
import { AdminGuard } from '../autenticacion/guards/admin.guard';

@Controller('estadisticas')
@UseGuards(AuthGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

    @Get('publicaciones-por-usuario')
    publicacionesPorUsuario(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    ) {
    return this.estadisticasService.publicacionesPorUsuario(desde, hasta);
    }

    @Get('comentarios-por-periodo')
    comentariosPorPeriodo(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    ) {
    return this.estadisticasService.comentariosPorPeriodo(desde, hasta);
    }

    @Get('comentarios-por-publicacion')
    comentariosPorPublicacion(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    ) {
    return this.estadisticasService.comentariosPorPublicacion(desde, hasta);
    }

}