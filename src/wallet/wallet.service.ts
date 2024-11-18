import { Injectable } from '@nestjs/common';
import { TronWeb } from 'tronweb';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WalletService {
  private tronWeb;

  constructor() {
    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_FULL_HOST || 'https://api.trongrid.io',
      privateKey: process.env.MASTER_PRIVATE_KEY || '',
    });
  }

  generateApiKey(): string {
    return uuidv4();
  }

  async createWallet(): Promise<{ address: string; privateKey: string }> {
    const account = await this.tronWeb.createAccount();
    return {
      address: account.address.base58,
      privateKey: account.privateKey,
    };
  }

  async getTransactions(address: string): Promise<any[]> {
    return await this.tronWeb.trx.getTransactionsRelated(address, 'to');
  }

  async withdraw(
    privateKey: string,
    toAddress: string,
    amount: number,
  ): Promise<{ txId: string }> {
    this.tronWeb.setPrivateKey(privateKey);
    const transaction = await this.tronWeb.trx.sendToken(
      toAddress,
      amount,
      '1002000',
    ); // Token ID for USDT
    return { txId: transaction.txid };
  }
}
