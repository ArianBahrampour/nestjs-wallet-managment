import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserRepository } from './user/user.repository';
import { ApiKeyMiddleware } from './middlewares/api-key.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const userRepository = app.get(UserRepository);

  await app.listen(8000);
}
bootstrap();
