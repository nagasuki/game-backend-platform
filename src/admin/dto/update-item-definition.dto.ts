import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateItemDefinitionDto {
  @ApiPropertyOptional({ example: 'Small Potion Plus' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ example: 'consumable' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  type?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @ApiPropertyOptional({
    example: {
      heal: 75,
      rarity: 'uncommon',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
