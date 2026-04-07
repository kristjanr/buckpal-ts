import { Activity, AccountId } from './activity';
import { Money } from './money';

export class ActivityWindow {
  private readonly activities: Activity[];

  constructor(activities: Activity[]) {
    this.activities = [...activities];
  }

  getActivities(): ReadonlyArray<Activity> {
    return this.activities;
  }

  addActivity(activity: Activity): void {
    this.activities.push(activity);
  }

  getStartTimestamp(): Date {
    return this.activities.reduce(
      (min, a) => (a.timestamp < min ? a.timestamp : min),
      this.activities[0].timestamp,
    );
  }

  getEndTimestamp(): Date {
    return this.activities.reduce(
      (max, a) => (a.timestamp > max ? a.timestamp : max),
      this.activities[0].timestamp,
    );
  }

  calculateBalance(accountId: AccountId): Money {
    const depositBalance = this.activities
      .filter((a) => a.targetAccountId.value === accountId.value)
      .reduce((sum, a) => sum.plus(a.money), Money.ZERO);

    const withdrawalBalance = this.activities
      .filter((a) => a.sourceAccountId.value === accountId.value)
      .reduce((sum, a) => sum.plus(a.money), Money.ZERO);

    return depositBalance.minus(withdrawalBalance);
  }
}
