import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
import { CurrencyModule } from './currency/currency.module';
import { AdminModule } from './admin/admin.module';
import { DailyRewardsModule } from './daily-rewards/daily-rewards.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    InventoryModule,
    CurrencyModule,
    AdminModule,
    DailyRewardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
