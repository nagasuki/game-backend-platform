import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';
import { RewardScheduleTypeDto } from './scheduled-reward-query.dto';

export class ClaimScheduledRewardDto {
  @ApiProperty({ example: 'rpg-01' })
  @IsString()
  @MinLength(1)
  gameKey: string;

  @ApiProperty({ enum: RewardScheduleTypeDto, example: RewardScheduleTypeDto.DAILY })
  @IsEnum(RewardScheduleTypeDto)
  scheduleType: RewardScheduleTypeDto;
}
