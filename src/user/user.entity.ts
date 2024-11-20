import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { WalletEntity } from '../wallet/wallet.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  apiKey: string;

  @OneToMany(() => WalletEntity, (wallet) => wallet.user)
  wallets: WalletEntity[];
}
