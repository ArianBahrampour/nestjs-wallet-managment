import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { WalletEntity } from './wallet.entity';

@Injectable()
export class WalletRepository extends Repository<WalletEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(WalletEntity, dataSource.createEntityManager());
  }

  /**
   * Save a new wallet in the database.
   * @param address - Wallet address.
   * @param privateKey - Wallet private key.
   * @param userId - Associated user ID.
   * @returns Saved wallet entity.
   */
  async saveWallet(
    address: string,
    privateKey: string,
    userId: string,
  ): Promise<WalletEntity> {
    const wallet = this.create({ address, privateKey, userId });
    return await this.save(wallet);
  }

  /**
   * Find all wallets associated with a user.
   * @param userId - User ID.
   * @returns Array of wallets.
   */
  async findWalletsByUserId(userId: string): Promise<WalletEntity[]> {
    return await this.find({ where: { userId } });
  }

  /**
   * Find a wallet by its address.
   * @param address - Wallet address.
   * @returns Wallet entity.
   */
  async findWalletByAddress(address: string): Promise<WalletEntity | null> {
    return await this.findOne({ where: { address } });
  }

  /**
   * Delete a wallet by its ID.
   * @param walletId - Wallet ID.
   * @returns Deletion result.
   */
  async deleteWallet(walletId: string): Promise<void> {
    await this.delete(walletId);
  }
}
