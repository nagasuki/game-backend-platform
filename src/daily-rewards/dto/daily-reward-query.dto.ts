import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';

export enum RewardScheduleTypeDto {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  YEARLY = 'YEARLY',
}

export class DailyRewardQueryDto {
  @ApiProperty({ example: 'rpg-01' })
  @IsString()
  @MinLength(1)
  gameKey: string;

  @ApiProperty({ enum: RewardScheduleTypeDto, example: RewardScheduleTypeDto.DAILY })
  @IsEnum(RewardScheduleTypeDto)
  scheduleType: RewardScheduleTypeDto;
}
