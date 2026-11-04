import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { __values } from 'tslib';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})

export class Login implements OnInit{
  formLogin = new FormGroup({
    usuario : new FormControl('',{
      validators: [Validators.required],
        
      }
    ),
    clave : new FormControl('',{
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(10)]
    })
    
  })

  ngOnInit(): void {};

  ingresar(){

  };

}
