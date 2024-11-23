import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(private readonly userRepository: UserRepository) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['authorization']?.replace('Bearer ', '');
    if (!apiKey) {
      return next(new UnauthorizedException('API key required'));
    }

    const user = await this.userRepository.findByApiKey(apiKey);
    if (!user) {
      return next(new UnauthorizedException('Invalid API key'));
    }

    req['user'] = user;
    next();
  }
}
