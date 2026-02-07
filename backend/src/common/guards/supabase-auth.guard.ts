import jwt from 'jsonwebtoken';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const token = request.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }

    const decoded = jwt.decode(token);

    if (!decoded) {
      throw new UnauthorizedException('Invalid token');
    }

    // Attach user info to request
    request.user = decoded;

    return true;
  }
}
