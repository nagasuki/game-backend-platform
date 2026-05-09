import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export enum DailyRewardTypeDto {
  CURRENCY = 'CURRENCY',
  ITEM = 'ITEM',
}

export enum RewardScheduleTypeDto {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  YEARLY = 'YEARLY',
}

export class CreateDailyRewardDefinitionDto {
  @ApiProperty({ example: 'rpg-01' })
  @IsString()
  @MinLength(1)
  gameKey: string;

  @ApiProperty({ enum: RewardScheduleTypeDto, example: RewardScheduleTypeDto.DAILY })
  @IsEnum(RewardScheduleTypeDto)
  scheduleType: RewardScheduleTypeDto;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  sequence: number;

  @ApiProperty({ enum: DailyRewardTypeDto, example: DailyRewardTypeDto.CURRENCY })
  @IsEnum(DailyRewardTypeDto)
  rewardType: DailyRewardTypeDto;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 'gold' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  currencyCode?: string;

  @ApiPropertyOptional({ example: 'potion_small' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  itemCode?: string;

  @ApiPropertyOptional({
    example: {
      label: 'Day 1 reward',
      featured: true,
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
