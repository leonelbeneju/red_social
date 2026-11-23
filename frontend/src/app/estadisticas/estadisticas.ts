import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { EstadisticasService } from '../core/services/estadisticas.service';

import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css'
})
export class Estadisticas {

  constructor() {
  Chart.register(...registerables);
  }

  private estadisticasService = inject(EstadisticasService);
  private cdr = inject(ChangeDetectorRef);

  desde: string = '';
  hasta: string = '';

  publicacionesPorUsuario: any[] = [];
  comentariosPorPeriodo: any[] = [];
  comentariosPorPublicacion: any[] = [];

  cargando = false;
  mensajeError = '';

  opcionesGrafico: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    }
  };

    // Gráfico de publicaciones por usuario
  publicacionesChart: any = {
    labels: [],
    datasets: [{
      label: 'Publicaciones',
      data: [],
      backgroundColor: '#238653'
    }]
  };

  // Gráfico de comentarios por período
  comentariosPeriodoChart: any = {
    labels: [],
    datasets: [{
      label: 'Comentarios',
      data: [],
      borderColor: '#238653',
      backgroundColor: 'rgba(35, 134, 83, 0.15)',
      fill: true,
      tension: 0.3
    }]
  };

  // Gráfico de comentarios por publicación
  comentariosPublicacionChart: any = {
    labels: [],
    datasets: [{
      label: 'Comentarios',
      data: [],
      backgroundColor: [
        '#176b3e',
        '#238653',
        '#65a982',
        '#9bc9aa',
        '#c5dfce',
        '#e0eee5'
      ]
    }]
  };



  consultarEstadisticas() {

    if (!this.desde || !this.hasta) {
      this.mensajeError = 'Seleccioná una fecha desde y hasta.';
      return;
    }

    if (this.desde > this.hasta) {
      this.mensajeError = 'La fecha desde no puede ser posterior a la fecha hasta.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    forkJoin({
      publicaciones: this.estadisticasService.publicacionesPorUsuario(
        this.desde, this.hasta
      ),
      comentariosPeriodo: this.estadisticasService.comentariosPorPeriodo(
        this.desde, this.hasta
      ),
      comentariosPublicacion: this.estadisticasService.comentariosPorPublicacion(
        this.desde, this.hasta
      )
    }).subscribe({
      next: (datos) => {
        this.publicacionesPorUsuario = datos.publicaciones;
        this.comentariosPorPeriodo = datos.comentariosPeriodo;
        this.comentariosPorPublicacion = datos.comentariosPublicacion;

                // Actualizar gráfico de publicaciones por usuario
        this.publicacionesChart = {
          labels: this.publicacionesPorUsuario.map(item => item.usuario),
          datasets: [{
            label: 'Publicaciones',
            data: this.publicacionesPorUsuario.map(item => item.cantidad),
            backgroundColor: '#238653'
          }]
        };

        // Actualizar gráfico de comentarios por período
        this.comentariosPeriodoChart = {
          labels: this.comentariosPorPeriodo.map(item => item._id),
          datasets: [{
            label: 'Comentarios',
            data: this.comentariosPorPeriodo.map(item => item.cantidad),
            borderColor: '#238653',
            backgroundColor: 'rgba(35, 134, 83, 0.15)',
            fill: true,
            tension: 0.3
          }]
        };

        // Actualizar gráfico de comentarios por publicación
        this.comentariosPublicacionChart = {
          labels: this.comentariosPorPublicacion.map(item => item.titulo),
          datasets: [{
            label: 'Comentarios',
            data: this.comentariosPorPublicacion.map(item => item.cantidad),
            backgroundColor: [
              '#176b3e',
              '#238653',
              '#65a982',
              '#9bc9aa',
              '#c5dfce',
              '#e0eee5'
            ]
          }]
        };

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeError = 'No se pudieron obtener las estadísticas. Intentá nuevamente.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
