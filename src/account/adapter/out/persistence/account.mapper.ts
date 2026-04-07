import { Injectable } from '@nestjs/common';
import { Account, AccountId } from '../../../application/domain/model/account';
import { Activity, ActivityId } from '../../../application/domain/model/activity';
import { ActivityWindow } from '../../../application/domain/model/activity-window';
import { Money } from '../../../application/domain/model/money';
import { ActivityOrmEntity } from './activity.orm-entity';

@Injectable()
export class AccountMapper {
  mapToDomainEntity(
    accountId: number,
    activities: ActivityOrmEntity[],
    withdrawalBalance: bigint,
    depositBalance: bigint,
  ): Account {
    const baselineBalance = new Money(depositBalance - withdrawalBalance);

    return Account.withId(
      new AccountId(accountId),
      baselineBalance,
      this.mapToActivityWindow(activities),
    );
  }

  mapToActivityWindow(activities: ActivityOrmEntity[]): ActivityWindow {
    const domainActivities = activities.map(
      (a) =>
        new Activity(
          a.id ? new ActivityId(a.id) : null,
          new AccountId(a.ownerAccountId),
          new AccountId(a.sourceAccountId),
          new AccountId(a.targetAccountId),
          new Date(a.timestamp),
          new Money(BigInt(a.amount)),
        ),
    );
    return new ActivityWindow(domainActivities);
  }

  mapToOrmEntity(activity: Activity): ActivityOrmEntity {
    const entity = new ActivityOrmEntity();
    if (activity.id) {
      entity.id = activity.id.value;
    }
    entity.timestamp = activity.timestamp;
    entity.ownerAccountId = activity.ownerAccountId.value;
    entity.sourceAccountId = activity.sourceAccountId.value;
    entity.targetAccountId = activity.targetAccountId.value;
    entity.amount = activity.money.amount.toString();
    return entity;
  }
}
