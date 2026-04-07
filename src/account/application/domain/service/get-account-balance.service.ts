import { Injectable } from '@nestjs/common';
import {
  GetAccountBalanceQuery,
  GetAccountBalanceUseCase,
} from '../../port/in/get-account-balance.use-case';
import { LoadAccountPort } from '../../port/out/load-account.port';
import { Money } from '../model/money';

@Injectable()
export class GetAccountBalanceService extends GetAccountBalanceUseCase {
  constructor(private readonly loadAccountPort: LoadAccountPort) {
    super();
  }

  async getAccountBalance(query: GetAccountBalanceQuery): Promise<Money> {
    const account = await this.loadAccountPort.loadAccount(
      query.accountId,
      new Date(),
    );
    return account.calculateBalance();
  }
}
