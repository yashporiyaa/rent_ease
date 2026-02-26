import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { supabase } from '../../lib/supabase.js';
import type { AuthenticatedRequest } from '../../types/authenticated-request.js';

type GuardRequest = Request & Partial<Pick<AuthenticatedRequest, 'user'>>;

const getCookieToken = (
  cookieHeader: string | undefined,
  cookieName: string,
): string | undefined => {
  if (!cookieHeader) {
    return undefined;
  }

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name === cookieName) {
      return decodeURIComponent(valueParts.join('='));
    }
  }

  return undefined;
};

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<GuardRequest>();
    const authorizationHeader = request.headers?.authorization;
    const authHeader =
      typeof authorizationHeader === 'string' ? authorizationHeader : undefined;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;
    const rawCookieHeader = request.headers?.cookie;
    const cookieHeader =
      typeof rawCookieHeader === 'string' ? rawCookieHeader : undefined;
    const cookieToken = getCookieToken(cookieHeader, 'accessToken');
    const token = cookieToken ?? bearerToken;

    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = {
      sub: data.user.id,
      email: data.user.email,
      role: data.user.role,
    };

    return true;
  }
}
