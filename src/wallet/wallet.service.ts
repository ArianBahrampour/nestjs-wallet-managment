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
import { TransactionEntity } from './transaction.entity';

@Injectable()
export class WalletService {
  private tronWeb;
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    private readonly energyService: EnergyService, // Inject EnergyService
  ) {
    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_FULL_HOST || 'https://api.trongrid.io',
      headers: { 'TRON-PRO-API-KEY': '05a81fdd-1b56-4faa-b20b-e0d0eba9862e' },
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
    const lastUserWallet = await this.walletRepository.findOne({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });

    if (lastUserWallet && !lastUserWallet.hasSuccessfulTransaction) {
      throw new UnauthorizedException(
        'Please complete the last transaction before creating a new wallet',
      );
    }

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

  async getTransactions(user: UserEntity): Promise<any[]> {
    const transactions = await this.transactionRepository.find({
      where: { userId: user.id },
    });
    return transactions;
  }

  async getWallets(user: UserEntity): Promise<WalletEntity[]> {
    return await this.walletRepository.find({
      select: ['address', 'hasSuccessfulTransaction', 'createdAt'],
      where: { userId: user.id },
    });
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

    if (user.usdtBalance < amount) {
      throw new UnauthorizedException('Insufficient balance');
    }

    const usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
    const contract = await this.tronWeb.contract().at(usdtContractAddress);
    const energyLimit = 1000000;

    // Rent energy before initiating the withdrawal
    const energy = await this.energyService.rentEnergy(
      32000,
      wallet.address,
      '',
      uuidv4(),
    );
    if (!energy) {
      throw new UnauthorizedException('Failed to rent energy');
    }

    // Perform the withdrawal
    this.tronWeb.setPrivateKey(wallet.privateKey);
    const transaction = await contract.methods
      .transfer(this.tronWeb.address.toHex(toAddress), amount * 1000000)
      .send({
        feeLimit: energyLimit,
        energyLimit: 1000000,
      });

    this.transactionRepository.save({
      txId: transaction.txid,
      fromAddress: wallet.address,
      toAddress: toAddress,
      amount: amount,
      status: 'PENDING',
      block: transaction.blockNumber,
      user: user,
      wallet: wallet,
    });

    return { txId: transaction.txid };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkWalletTransactions(): Promise<void> {
    this.logger.log('Checking transactions for all wallets...');

    const transactions = await this.transactionRepository.find({
      where: { status: 'PENDING' },
    });

    for (const transaction of transactions) {
      const result = await this.tronWeb.trx.getTransaction(transaction.txId);
      if (result && result.ret && result.ret[0].contractRet === 'SUCCESS') {
        await this.transactionRepository.update(
          { id: transaction.id },
          { status: 'SUCCESS' },
        );
        await this.walletRepository.update(
          { id: transaction.wallet.id },
          { hasSuccessfulTransaction: true },
        );
      }
    }
  }

  // Cronjob to update the USDT balance of all users
  @Cron(CronExpression.EVERY_MINUTE)
  async updateUSDTBalances(): Promise<void> {
    this.logger.log('Updating USDT balances for all users...');
    this.tronWeb.setAddress('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');
    const usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
    const contract = await this.tronWeb.contract().at(usdtContractAddress);
    const users = await this.userRepository.find();
    for (const user of users) {
      const wallets = await this.walletRepository.find({
        where: { userId: user.id },
      });

      let usdtBalance = 0;
      for (const wallet of wallets) {
        if (user.usdtBalance > 0) {
          continue;
        }
        const balance = await contract.methods
          .balanceOf(this.tronWeb.address.toHex(wallet.address))
          .call();
        // Gets 10000n
        console.log(balance.toString(10));
        usdtBalance += parseInt(balance.toString(10)) / 1000000;
      }

      await this.walletRepository.update(
        {
          address: wallets[0].address,
        },
        {
          hasSuccessfulTransaction: true,
        },
      );
      console.log(usdtBalance);
      await this.userRepository.update(
        { id: user.id },
        { usdtBalance: usdtBalance },
      );
    }
  }
}
