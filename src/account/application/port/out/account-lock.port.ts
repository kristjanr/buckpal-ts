import { AccountId } from '../../domain/model/activity';

export abstract class AccountLock {
  abstract lockAccount(accountId: AccountId): void;
  abstract releaseAccount(accountId: AccountId): void;
}
