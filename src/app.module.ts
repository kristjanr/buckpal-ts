import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountModule } from './account/account.module';
import { AccountOrmEntity } from './account/adapter/out/persistence/account.orm-entity';
import { ActivityOrmEntity } from './account/adapter/out/persistence/activity.orm-entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3' as const,
        database: configService.get<string>('DATABASE_PATH') ?? ':memory:',
        entities: [AccountOrmEntity, ActivityOrmEntity],
        synchronize: true,
      }),
    }),
    AccountModule,
  ],
})
export class AppModule {}
