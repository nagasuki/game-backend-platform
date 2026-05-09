import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DailyRewardsController } from './daily-rewards.controller';
import { DailyRewardsService } from './daily-rewards.service';

@Module({
  imports: [PrismaModule],
  controllers: [DailyRewardsController],
  providers: [DailyRewardsService],
})
export class DailyRewardsModule {}
