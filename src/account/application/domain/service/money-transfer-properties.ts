import { Money } from '../model/money';

export class MoneyTransferProperties {
  constructor(readonly maximumTransferThreshold: Money = Money.of(1_000_000)) {}
}
