// src/app.module.ts
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WalletModule } from './wallet/wallet.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyMiddleware } from './middlewares/api-key.middleware';
import { UserModule } from './user/user.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'tron',
      database: process.env.DB_NAME || 'tron_wallet',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    WalletModule,
    UserModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .exclude({ path: '/generate-api-key', method: RequestMethod.ALL })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
