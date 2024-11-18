import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('wallets')
export class WalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  address: string;

  @Column()
  privateKey: string;
}
