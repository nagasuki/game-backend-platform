import { PartialType } from '@nestjs/swagger';
import { CreateDailyRewardDefinitionDto } from './create-daily-reward-definition.dto';

export class UpdateDailyRewardDefinitionDto extends PartialType(
  CreateDailyRewardDefinitionDto,
) {}
