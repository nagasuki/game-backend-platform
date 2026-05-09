import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ClaimDailyRewardDto } from './dto/claim-daily-reward.dto';
import { DailyRewardQueryDto } from './dto/daily-reward-query.dto';
import { DailyRewardsService } from './daily-rewards.service';

@ApiTags('daily-rewards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('daily-rewards')
export class DailyRewardsController {
  constructor(private readonly dailyRewardsService: DailyRewardsService) {}

  @ApiOperation({ summary: 'Get scheduled reward progress and schedule for the current user' })
  @Get('me')
  getMyDailyRewards(
    @Req() req: Request & { user: { userId: string } },
    @Query() query: DailyRewardQueryDto,
  ) {
    return this.dailyRewardsService.getMyDailyRewards(
      req.user.userId,
      query.gameKey,
      query.scheduleType,
    );
  }

  @ApiOperation({ summary: 'Claim the current scheduled reward for the current user' })
  @Post('claim')
  claimDailyReward(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: ClaimDailyRewardDto,
  ) {
    return this.dailyRewardsService.claimDailyReward(
      req.user.userId,
      dto.gameKey,
      dto.scheduleType,
    );
  }
}
