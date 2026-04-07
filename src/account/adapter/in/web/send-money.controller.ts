import { Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { SendMoneyUseCase } from '../../../application/port/in/send-money.use-case';
import { SendMoneyCommand } from '../../../application/port/in/send-money.command';
import { AccountId } from '../../../application/domain/model/activity';
import { Money } from '../../../application/domain/model/money';

@Controller('accounts')
export class SendMoneyController {
  constructor(private readonly sendMoneyUseCase: SendMoneyUseCase) {}

  @Post('send/:sourceAccountId/:targetAccountId/:amount')
  async sendMoney(
    @Param('sourceAccountId', ParseIntPipe) sourceAccountId: number,
    @Param('targetAccountId', ParseIntPipe) targetAccountId: number,
    @Param('amount', ParseIntPipe) amount: number,
  ): Promise<void> {
    const command = new SendMoneyCommand(
      new AccountId(sourceAccountId),
      new AccountId(targetAccountId),
      Money.of(amount),
    );

    await this.sendMoneyUseCase.sendMoney(command);
  }
}
