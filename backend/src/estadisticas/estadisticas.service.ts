import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Publicacion,
  PublicacionDocument
} from '../publicaciones/entities/publicacion.entity';

import {
  Usuario
} from '../usuarios/entities/usuario.entity';

@Injectable()
export class EstadisticasService {
  
  constructor(
    @InjectModel(Publicacion.name)
    private publicacionModel: Model<PublicacionDocument>,

    @InjectModel(Usuario.name)
    private usuarioModel: Model<Usuario>,
  ) {}

    async publicacionesPorUsuario(desde: string, hasta: string) {
    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

        return this.publicacionModel.aggregate([
            {
            $match: {
                activo: true,
                createdAt: {
                $gte: fechaDesde,
                $lte: fechaHasta,
                },
            },
            },
            {
            $addFields: {
                autorObjectId: { $toObjectId: '$autor' },
            },
            },
            {
            $group: {
                _id: '$autorObjectId',
                cantidad: { $sum: 1 },
            },
            },
            {
            $lookup: {
                from: 'usuarios',
                localField: '_id',
                foreignField: '_id',
                as: 'usuario',
            },
            },
            {
            $unwind: '$usuario',
            },
            {
            $project: {
                _id: 0,
                usuario: {
                $concat: ['$usuario.nombre', ' ', '$usuario.apellido'],
                },
                cantidad: 1,
            },
            },
            {
            $sort: {
                cantidad: -1,
            },
            },
        ]);
    }

    async comentariosPorPeriodo(desde: string, hasta: string) {
    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

        return this.publicacionModel.aggregate([
            {
            $unwind: '$comentarios',
            },
            {
            $match: {
                'comentarios.createdAt': {
                $gte: fechaDesde,
                $lte: fechaHasta,
                },
                activo: true,
            },
            },
            {
            $group: {
                _id: {
                $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$comentarios.createdAt',
                },
                },
                cantidad: { $sum: 1 },
            },
            },
            {
            $sort: {
                _id: 1,
            },
            },
        ]);
    }

    async comentariosPorPublicacion(desde: string, hasta: string) {
    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

        return this.publicacionModel.aggregate([
            {
            $unwind: '$comentarios',
            },
            {
            $match: {
                'comentarios.createdAt': {
                $gte: fechaDesde,
                $lte: fechaHasta,
                },
                activo: true,
            },
            },
            {
            $group: {
                _id: '$_id',
                titulo: { $first: '$titulo' },
                cantidad: { $sum: 1 },
            },
            },
            {
            $sort: {
                cantidad: -1,
            },
            },
        ]);
    }

}