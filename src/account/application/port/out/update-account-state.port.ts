import { Account } from '../../domain/model/account';

export abstract class UpdateAccountStatePort {
  abstract updateActivities(account: Account): Promise<void>;
}
