export class Money {
  static readonly ZERO = new Money(0n);

  constructor(readonly amount: bigint) {}

  static of(value: number): Money {
    return new Money(BigInt(value));
  }

  isPositive(): boolean {
    return this.amount > 0n;
  }

  isNegative(): boolean {
    return this.amount < 0n;
  }

  isGreaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  plus(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  minus(other: Money): Money {
    return new Money(this.amount - other.amount);
  }

  negate(): Money {
    return new Money(-this.amount);
  }
}
