import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TransactionsDto } from 'src/common/dto/transaction.dto';
import { WithdrawDto } from 'src/common/dto/withdraw.dto';
import { Response } from 'src/common/dto/response.dto';

@Controller('/')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('/generate-api-key')
  generateApiKey(): Response {
    return {
      status: 200,
      message: 'API key generated',
      data: { apiKey: this.walletService.generateApiKey() },
    };
  }

  @Post('/create-wallet')
  async createWallet(): Promise<Response> {
    return {
      status: 200,
      message: 'Wallet created',
      data: await this.walletService.createWallet(),
    };
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
