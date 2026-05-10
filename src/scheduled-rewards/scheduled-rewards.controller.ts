import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ClaimScheduledRewardDto } from './dto/claim-scheduled-reward.dto';
import { ScheduledRewardHistoryQueryDto } from './dto/scheduled-reward-history-query.dto';
import { ScheduledRewardQueryDto } from './dto/scheduled-reward-query.dto';
import { ScheduledRewardsService } from './scheduled-rewards.service';

@ApiTags('scheduled-rewards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scheduled-rewards')
export class ScheduledRewardsController {
  constructor(
    private readonly scheduledRewardsService: ScheduledRewardsService,
  ) {}

  @ApiOperation({
    summary: 'Get scheduled reward progress and schedule for the current user',
  })
  @Get('me')
  getMyScheduledRewards(
    @Req() req: Request & { user: { userId: string } },
    @Query() query: ScheduledRewardQueryDto,
  ) {
    return this.scheduledRewardsService.getMyScheduledRewards(
      req.user.userId,
      query.gameKey,
      query.scheduleType,
    );
  }

  @ApiOperation({
    summary: 'Get scheduled reward claim history for the current user',
  })
  @Get('history')
  getMyRewardHistory(
    @Req() req: Request & { user: { userId: string } },
    @Query() query: ScheduledRewardHistoryQueryDto,
  ) {
    return this.scheduledRewardsService.getMyRewardHistory(
      req.user.userId,
      query.gameKey,
      query.scheduleType,
      query.limit,
    );
  }

  @ApiOperation({
    summary: 'Claim the current scheduled reward for the current user',
  })
  @Post('claim')
  claimScheduledReward(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: ClaimScheduledRewardDto,
  ) {
    return this.scheduledRewardsService.claimScheduledReward(
      req.user.userId,
      dto.gameKey,
      dto.scheduleType,
    );
  }
}
