import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('activity')
export class ActivityOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  timestamp!: Date;

  @Column()
  ownerAccountId!: number;

  @Column()
  sourceAccountId!: number;

  @Column()
  targetAccountId!: number;

  @Column({ type: 'bigint' })
  amount!: string;
}
