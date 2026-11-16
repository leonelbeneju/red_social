import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const token = this.extractToken(context);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const payload = this.jwtService.verify(token);

      console.log(payload);

      context.switchToHttp().getRequest().user = payload;

      return true;

    } catch (e) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  extractToken(context: ExecutionContext): string | null {

    const authorization = context
      .switchToHttp()
      .getRequest()
      .headers['authorization'];

    const token = authorization?.split(' ')[1];

    return token || null;
  }
}
