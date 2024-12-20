import { Request } from 'express';
import { UserEntity } from 'src/user/user.entity';

export interface RequestWithUser extends Request {
  user: UserEntity;
}
