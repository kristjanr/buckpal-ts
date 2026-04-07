import { Injectable } from '@nestjs/common';
import { AccountLock } from '../../../application/port/out/account-lock.port';
import { AccountId } from '../../../application/domain/model/activity';

@Injectable()
export class NoOpAccountLock extends AccountLock {
  lockAccount(_accountId: AccountId): void {
    // no-op
  }

  releaseAccount(_accountId: AccountId): void {
    // no-op
  }
}
