import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TronWeb } from 'tronweb';
import { v4 as uuidv4 } from 'uuid';
import { WalletRepository } from './wallet.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletEntity } from './wallet.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { EnergyService } from 'src/energy/energy.service';

@Injectable()
export class WalletService {
  private tronWeb;
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly energyService: EnergyService, // Inject EnergyService
  ) {
    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_FULL_HOST || 'https://api.trongrid.io',
      privateKey: process.env.MASTER_PRIVATE_KEY || '',
    });
  }

  async generateApiKey(): Promise<string> {
    const apiKey = uuidv4();
    // Creating user
    const user = await this.userRepository.save({
      email: '',
      apiKey: apiKey,
    });

    return apiKey;
  }

  async createWallet(
    user: UserEntity,
  ): Promise<{ address: string; privateKey: string }> {
    const account = await this.tronWeb.createAccount();
    await this.walletRepository.save({
      userId: user.id,
      address: account.address.base58,
      privateKey: account.privateKey,
    });

    return {
      address: account.address.base58,
      privateKey: account.privateKey,
    };
  }

  async getTransactions(address: string): Promise<any[]> {
    return await this.tronWeb.trx.getTransactionsRelated(address, 'to');
  }

  async withdraw(
    user: UserEntity,
    toAddress: string,
    amount: number,
  ): Promise<{ txId: string }> {
    const wallet = await this.walletRepository.findOne({
      where: { userId: user.id },
    });
    if (!wallet) {
      throw new UnauthorizedException('Wallet not found');
    }

    // Rent energy before initiating the withdrawal
    await this.energyService.rentEnergy(32000, wallet.address, '', uuidv4());

    // Perform the withdrawal
    this.tronWeb.setPrivateKey(wallet.privateKey);
    const transaction = await this.tronWeb.trx.sendToken(
      toAddress,
      amount,
      '1002000',
    ); // Token ID for USDT
    return { txId: transaction.txid };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkWalletTransactions(): Promise<void> {
    this.logger.log('Checking transactions for all wallets...');

    const wallets = await this.walletRepository.find(); // Fetch all wallets
    for (const wallet of wallets) {
      try {
        const transactions = await this.tronWeb.trx.getTransactionsRelated(
          wallet.address,
          'to',
        );
        if (transactions && transactions.length > 0) {
          this.logger.log(
            `Wallet ${wallet.address}: Found ${transactions.length} transactions`,
          );
          transactions.forEach((tx) => {
            this.logger.log(
              `Transaction ID: ${tx.txID}, Amount: ${tx.raw_data.contract[0].parameter.value.amount}`,
            );
          });
        } else {
          this.logger.log(`Wallet ${wallet.address}: No transactions found`);
        }
      } catch (error) {
        this.logger.error(
          `Error fetching transactions for wallet ${wallet.address}: ${error.message}`,
        );
      }
    }
  }
}
