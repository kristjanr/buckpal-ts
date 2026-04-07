import { Injectable } from '@nestjs/common';
import { SendMoneyUseCase } from '../../port/in/send-money.use-case';
import { SendMoneyCommand } from '../../port/in/send-money.command';
import { LoadAccountPort } from '../../port/out/load-account.port';
import { UpdateAccountStatePort } from '../../port/out/update-account-state.port';
import { AccountLock } from '../../port/out/account-lock.port';
import { MoneyTransferProperties } from './money-transfer-properties';
import { ThresholdExceededException } from './threshold-exceeded.exception';

@Injectable()
export class SendMoneyService extends SendMoneyUseCase {
  constructor(
    private readonly loadAccountPort: LoadAccountPort,
    private readonly accountLock: AccountLock,
    private readonly updateAccountStatePort: UpdateAccountStatePort,
    private readonly moneyTransferProperties: MoneyTransferProperties,
  ) {
    super();
  }

  async sendMoney(command: SendMoneyCommand): Promise<boolean> {
    this.checkThreshold(command);

    const baselineDate = new Date();
    baselineDate.setDate(baselineDate.getDate() - 10);

    const sourceAccount = await this.loadAccountPort.loadAccount(
      command.sourceAccountId,
      baselineDate,
    );

    const targetAccount = await this.loadAccountPort.loadAccount(
      command.targetAccountId,
      baselineDate,
    );

    this.accountLock.lockAccount(sourceAccount.getId());

    if (!sourceAccount.withdraw(command.money, targetAccount.getId())) {
      this.accountLock.releaseAccount(sourceAccount.getId());
      return false;
    }

    this.accountLock.lockAccount(targetAccount.getId());

    if (!targetAccount.deposit(command.money, sourceAccount.getId())) {
      this.accountLock.releaseAccount(sourceAccount.getId());
      this.accountLock.releaseAccount(targetAccount.getId());
      return false;
    }

    await this.updateAccountStatePort.updateActivities(sourceAccount);
    await this.updateAccountStatePort.updateActivities(targetAccount);

    this.accountLock.releaseAccount(sourceAccount.getId());
    this.accountLock.releaseAccount(targetAccount.getId());

    return true;
  }

  private checkThreshold(command: SendMoneyCommand): void {
    if (
      command.money.isGreaterThan(
        this.moneyTransferProperties.maximumTransferThreshold,
      )
    ) {
      throw new ThresholdExceededException(
        this.moneyTransferProperties.maximumTransferThreshold,
        command.money,
      );
    }
  }
}
