import { Money } from './money';

export class ActivityId {
  constructor(readonly value: number) {}
}

export class Activity {
  constructor(
    readonly id: ActivityId | null,
    readonly ownerAccountId: AccountId,
    readonly sourceAccountId: AccountId,
    readonly targetAccountId: AccountId,
    readonly timestamp: Date,
    readonly money: Money,
  ) {}
}

// Forward-import workaround: AccountId is defined here to avoid circular deps
export class AccountId {
  constructor(readonly value: number) {}
}
