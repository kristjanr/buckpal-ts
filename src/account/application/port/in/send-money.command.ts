import { AccountId } from '../../domain/model/activity';
import { Money } from '../../domain/model/money';

export class SendMoneyCommand {
  readonly sourceAccountId: AccountId;
  readonly targetAccountId: AccountId;
  readonly money: Money;

  constructor(
    sourceAccountId: AccountId,
    targetAccountId: AccountId,
    money: Money,
  ) {
    if (!sourceAccountId) {
      throw new Error('sourceAccountId must not be null');
    }
    if (!targetAccountId) {
      throw new Error('targetAccountId must not be null');
    }
    if (!money) {
      throw new Error('money must not be null');
    }
    if (!money.isPositive()) {
      throw new Error('money must be positive');
    }

    this.sourceAccountId = sourceAccountId;
    this.targetAccountId = targetAccountId;
    this.money = money;
  }
}
