import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<
      Request & { user?: { isAdmin?: boolean } }
    >();

    if (!request.user?.isAdmin) {
      throw new ForbiddenException('Admin access is required');
    }

    return true;
  }
}
