import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    {
        path:'login',
        loadComponent: () => import('./auth/login/login').then(m => m.Login)
        
    },

    {
        path:'miPerfil',
        loadComponent: () => import('./mi-perfil/mi-perfil').then(m => m.MiPerfil)
        
    },

    {
        path:'publicaciones',
        loadComponent: () => import('./publicaciones/publicaciones').then(m => m.Publicaciones)
        
    },

        
    {
        path: 'publicaciones/:id',
        loadComponent: () => import('./publicaciones/detalle-publicacion/detalle-publicacion')
        .then(m => m.DetallePublicacion)
    },
    
    {
        path:'registro',
        loadComponent: () => import('./auth/registro/registro').then(m => m.Registro)
        
    },

    {
        path:'**',
        redirectTo: 'login'
    }

];
