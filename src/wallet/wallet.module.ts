// src/wallet/wallet.module.ts
import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletEntity } from './wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WalletEntity])],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}

// src/wallet/wallet.controller.ts
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto, WithdrawDto, TransactionsDto } from './wallet.dto';

@Controller('/api')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('/generate-api-key')
  generateApiKey(): { apiKey: string } {
    return { apiKey: this.walletService.generateApiKey() };
  }

  @Post('/create-wallet')
  async createWallet(): Promise<CreateWalletDto> {
    return await this.walletService.createWallet();
  }

  @Get('/transactions')
  async getTransactions(@Query() params: TransactionsDto): Promise<any[]> {
    return await this.walletService.getTransactions(params.address);
  }

  @Post('/withdraw')
  async withdraw(@Body() body: WithdrawDto): Promise<{ txId: string }> {
    return await this.walletService.withdraw(
      body.privateKey,
      body.toAddress,
      body.amount,
    );
  }
}
