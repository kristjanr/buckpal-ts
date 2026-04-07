import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('account')
export class AccountOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;
}
