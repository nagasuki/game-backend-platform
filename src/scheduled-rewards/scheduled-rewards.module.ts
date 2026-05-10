import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ScheduledRewardsController } from './scheduled-rewards.controller';
import { ScheduledRewardsService } from './scheduled-rewards.service';

@Module({
  imports: [PrismaModule],
  controllers: [ScheduledRewardsController],
  providers: [ScheduledRewardsService],
})
export class ScheduledRewardsModule {}
