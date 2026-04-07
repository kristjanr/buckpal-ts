import { AccountId } from '../../domain/model/activity';
import { Account } from '../../domain/model/account';

export abstract class LoadAccountPort {
  abstract loadAccount(
    accountId: AccountId,
    baselineDate: Date,
  ): Promise<Account>;
}
