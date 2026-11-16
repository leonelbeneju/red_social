import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-sesion',
  standalone: true,
  imports: [],
  templateUrl: './modal-sesion.html',
  styleUrl: './modal-sesion.css'
})
export class ModalSesion {

  @Input() visible = false;

  @Output() extender = new EventEmitter<void>();

  @Output() cerrar = new EventEmitter<void>();

}
