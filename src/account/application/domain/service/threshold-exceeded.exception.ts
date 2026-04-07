import { Money } from '../model/money';

export class ThresholdExceededException extends Error {
  constructor(threshold: Money, actual: Money) {
    super(
      `Maximum threshold for transferring money exceeded: tried to transfer ${actual.amount} but threshold is ${threshold.amount}!`,
    );
    this.name = 'ThresholdExceededException';
  }
}
