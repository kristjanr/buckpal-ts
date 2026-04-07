import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountOrmEntity } from './adapter/out/persistence/account.orm-entity';
import { ActivityOrmEntity } from './adapter/out/persistence/activity.orm-entity';
import { AccountPersistenceAdapter } from './adapter/out/persistence/account-persistence.adapter';
import { AccountMapper } from './adapter/out/persistence/account.mapper';
import { NoOpAccountLock } from './adapter/out/persistence/no-op-account-lock';
import { SendMoneyService } from './application/domain/service/send-money.service';
import { GetAccountBalanceService } from './application/domain/service/get-account-balance.service';
import { MoneyTransferProperties } from './application/domain/service/money-transfer-properties';
import { LoadAccountPort } from './application/port/out/load-account.port';
import { UpdateAccountStatePort } from './application/port/out/update-account-state.port';
import { AccountLock } from './application/port/out/account-lock.port';
import { SendMoneyController } from './adapter/in/web/send-money.controller';
import { SendMoneyUseCase } from './application/port/in/send-money.use-case';
import { Money } from './application/domain/model/money';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AccountOrmEntity, ActivityOrmEntity]),
  ],
  controllers: [SendMoneyController],
  providers: [
    AccountMapper,
    AccountPersistenceAdapter,
    {
      provide: LoadAccountPort,
      useExisting: AccountPersistenceAdapter,
    },
    {
      provide: UpdateAccountStatePort,
      useExisting: AccountPersistenceAdapter,
    },
    {
      provide: AccountLock,
      useClass: NoOpAccountLock,
    },
    {
      provide: MoneyTransferProperties,
      useFactory: (configService: ConfigService) => {
        const threshold = configService.get<number>(
          'BUCKPAL_TRANSFER_THRESHOLD',
          10000,
        );
        return new MoneyTransferProperties(Money.of(threshold));
      },
      inject: [ConfigService],
    },
    SendMoneyService,
    {
      provide: SendMoneyUseCase,
      useExisting: SendMoneyService,
    },
    GetAccountBalanceService,
  ],
})
export class AccountModule {}
