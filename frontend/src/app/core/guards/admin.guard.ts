import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.obtenerToken();

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    if (payload.perfil === 'administrador') {
      return true;
    }

    router.navigate(['/publicaciones']);
    return false;

  } catch {
    router.navigate(['/login']);
    return false;
  }
};
