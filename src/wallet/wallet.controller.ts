import { Controller, Post, Get, Body, Query, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TransactionsDto } from 'src/common/dto/transaction.dto';
import { WithdrawDto } from 'src/common/dto/withdraw.dto';
import { Response } from 'src/common/dto/response.dto';
import { RequestWithUser } from 'src/common/types/request-with-user';

@Controller('/')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('/generate-api-key')
  async generateApiKey(): Promise<Response> {
    const apiKey = await this.walletService.generateApiKey();
    return {
      status: 200,
      message: 'API key generated',
      data: { apiKey: apiKey },
    };
  }

  @Post('/create-wallet')
  async createWallet(@Req() req: RequestWithUser): Promise<Response> {
    return {
      status: 200,
      message: 'Wallet created',
      data: await this.walletService.createWallet(req.user),
    };
  }

  @Get('/wallets')
  async getWallets(@Req() req: RequestWithUser): Promise<Response> {
    return {
      status: 200,
      message: 'Wallets fetched',
      data: await this.walletService.getWallets(req.user),
    };
  }

  @Get('/transactions')
  async getTransactions(@Req() req: RequestWithUser): Promise<Response> {
    return {
      status: 200,
      message: 'Transactions fetched',
      data: await this.walletService.getTransactions(req.user),
    };
  }

  @Post('/withdraw')
  async withdraw(
    @Req() req: RequestWithUser, // Access user from the request object
    @Body() body: WithdrawDto,
  ): Promise<{ txId: string }> {
    const user = req.user; // User attached in middleware
    return await this.walletService.withdraw(user, body.toAddress, body.amount);
  }
}
