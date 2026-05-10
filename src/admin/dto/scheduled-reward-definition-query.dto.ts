import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RewardScheduleTypeDto } from './create-scheduled-reward-definition.dto';

export class ScheduledRewardDefinitionQueryDto {
  @ApiProperty({ example: 'rpg-01' })
  @IsString()
  @MinLength(1)
  gameKey: string;

  @ApiPropertyOptional({
    enum: RewardScheduleTypeDto,
    example: RewardScheduleTypeDto.WEEKLY,
  })
  @IsOptional()
  @IsEnum(RewardScheduleTypeDto)
  scheduleType?: RewardScheduleTypeDto;
}
