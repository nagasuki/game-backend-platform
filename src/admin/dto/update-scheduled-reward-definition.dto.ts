import { PartialType } from '@nestjs/swagger';
import { CreateScheduledRewardDefinitionDto } from './create-scheduled-reward-definition.dto';

export class UpdateScheduledRewardDefinitionDto extends PartialType(
  CreateScheduledRewardDefinitionDto,
) {}
