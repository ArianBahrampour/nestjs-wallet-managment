import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { WalletEntity } from './wallet.entity';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  txId: string;

  @Column()
  fromAddress: string;

  @Column()
  toAddress: string;

  @Column()
  amount: number;

  @Column()
  status: string;

  @Column()
  block: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @JoinColumn({ name: 'walletId' })
  wallet: WalletEntity;

  @Column()
  userId: string;
}
