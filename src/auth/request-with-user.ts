import { Request } from 'express';
import { Users } from 'src/users/entities/user.entity';

export interface RequestWithUser extends Request {
  user: Users;
}
