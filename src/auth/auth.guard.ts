import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as BaseAuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { RequestWithUser } from './request-with-user';

@Injectable()
export class AuthGuard extends BaseAuthGuard('jwt') {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = (await super.canActivate(context)) as boolean;
    if (!canActivate) return false;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user; // Now TypeScript knows request.user exists

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    // Fetch full user details from DB
    const fullUser = await this.usersService.findById(user.id);
    if (!fullUser) {
      throw new UnauthorizedException('User not found in database');
    }

    request.user = fullUser; // Attach full user to request

    return true;
  }
}
