import { SendMoneyCommand } from './send-money.command';

export abstract class SendMoneyUseCase {
  abstract sendMoney(command: SendMoneyCommand): Promise<boolean>;
}
