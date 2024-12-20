import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletEntity } from './wallet.entity';
import { UserEntity } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { EnergyModule } from '../energy/energy.module'; // Import the EnergyModule
import { TransactionEntity } from './transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletEntity, UserEntity, TransactionEntity]),
    UserModule,
    EnergyModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
