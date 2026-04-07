import { AccountId } from '../../domain/model/activity';
import { Money } from '../../domain/model/money';

export class GetAccountBalanceQuery {
  constructor(readonly accountId: AccountId) {
    if (!accountId) {
      throw new Error('accountId must not be null');
    }
  }
}

export abstract class GetAccountBalanceUseCase {
  abstract getAccountBalance(query: GetAccountBalanceQuery): Promise<Money>;
}
