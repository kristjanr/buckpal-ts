import { AccountId, Activity } from './activity';
import { ActivityWindow } from './activity-window';
import { Money } from './money';

export { AccountId } from './activity';

export class Account {
  private constructor(
    readonly id: AccountId | null,
    readonly baselineBalance: Money,
    readonly activityWindow: ActivityWindow,
  ) {}

  static withId(
    accountId: AccountId,
    baselineBalance: Money,
    activityWindow: ActivityWindow,
  ): Account {
    return new Account(accountId, baselineBalance, activityWindow);
  }

  static withoutId(
    baselineBalance: Money,
    activityWindow: ActivityWindow,
  ): Account {
    return new Account(null, baselineBalance, activityWindow);
  }

  getId(): AccountId {
    if (!this.id) {
      throw new Error('Account has no id');
    }
    return this.id;
  }

  calculateBalance(): Money {
    return this.baselineBalance.plus(
      this.activityWindow.calculateBalance(this.getId()),
    );
  }

  withdraw(money: Money, targetAccountId: AccountId): boolean {
    if (!this.mayWithdraw(money)) {
      return false;
    }

    const withdrawal = new Activity(
      null,
      this.getId(),
      this.getId(),
      targetAccountId,
      new Date(),
      money,
    );
    this.activityWindow.addActivity(withdrawal);
    return true;
  }

  deposit(money: Money, sourceAccountId: AccountId): boolean {
    const deposit = new Activity(
      null,
      this.getId(),
      sourceAccountId,
      this.getId(),
      new Date(),
      money,
    );
    this.activityWindow.addActivity(deposit);
    return true;
  }

  private mayWithdraw(money: Money): boolean {
    return this.calculateBalance().minus(money).isPositive() ||
      this.calculateBalance().minus(money).amount === 0n;
  }
}
