import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { LoadAccountPort } from '../../../application/port/out/load-account.port';
import { UpdateAccountStatePort } from '../../../application/port/out/update-account-state.port';
import { Account, AccountId } from '../../../application/domain/model/account';
import { AccountOrmEntity } from './account.orm-entity';
import { ActivityOrmEntity } from './activity.orm-entity';
import { AccountMapper } from './account.mapper';

@Injectable()
export class AccountPersistenceAdapter
  extends LoadAccountPort
  implements UpdateAccountStatePort
{
  constructor(
    @InjectRepository(AccountOrmEntity)
    private readonly accountRepository: Repository<AccountOrmEntity>,
    @InjectRepository(ActivityOrmEntity)
    private readonly activityRepository: Repository<ActivityOrmEntity>,
    private readonly accountMapper: AccountMapper,
  ) {
    super();
  }

  async loadAccount(
    accountId: AccountId,
    baselineDate: Date,
  ): Promise<Account> {
    const account = await this.accountRepository.findOneBy({
      id: accountId.value,
    });

    if (!account) {
      throw new Error(`Account not found: ${accountId.value}`);
    }

    const activities = await this.activityRepository.find({
      where: {
        ownerAccountId: accountId.value,
        timestamp: MoreThan(baselineDate),
      },
    });

    const withdrawalBalance = await this.getWithdrawalBalanceUntil(
      accountId.value,
      baselineDate,
    );

    const depositBalance = await this.getDepositBalanceUntil(
      accountId.value,
      baselineDate,
    );

    return this.accountMapper.mapToDomainEntity(
      account.id,
      activities,
      withdrawalBalance,
      depositBalance,
    );
  }

  async updateActivities(account: Account): Promise<void> {
    for (const activity of account.activityWindow.getActivities()) {
      if (activity.id === null) {
        const entity = this.accountMapper.mapToOrmEntity(activity);
        await this.activityRepository.save(entity);
      }
    }
  }

  private async getDepositBalanceUntil(
    accountId: number,
    until: Date,
  ): Promise<bigint> {
    const result = await this.activityRepository
      .createQueryBuilder('activity')
      .select('COALESCE(SUM(activity.amount), 0)', 'sum')
      .where('activity.targetAccountId = :accountId', { accountId })
      .andWhere('activity.ownerAccountId = :accountId', { accountId })
      .andWhere('activity.timestamp <= :until', { until })
      .getRawOne();

    return BigInt(result?.sum ?? 0);
  }

  private async getWithdrawalBalanceUntil(
    accountId: number,
    until: Date,
  ): Promise<bigint> {
    const result = await this.activityRepository
      .createQueryBuilder('activity')
      .select('COALESCE(SUM(activity.amount), 0)', 'sum')
      .where('activity.sourceAccountId = :accountId', { accountId })
      .andWhere('activity.ownerAccountId = :accountId', { accountId })
      .andWhere('activity.timestamp <= :until', { until })
      .getRawOne();

    return BigInt(result?.sum ?? 0);
  }
}
