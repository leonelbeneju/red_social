import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.user?.perfil !== 'administrador') {
      throw new ForbiddenException(
        'No tenés permisos para realizar esta acción.',
      );
    }

    return true;
  }
}
