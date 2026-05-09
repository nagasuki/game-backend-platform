import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateItemDefinitionDto {
  @ApiProperty({ example: 'rpg-01' })
  @IsString()
  @MinLength(1)
  gameKey: string;

  @ApiProperty({ example: 'potion_small' })
  @IsString()
  @MinLength(1)
  code: string;

  @ApiProperty({ example: 'Small Potion' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'consumable' })
  @IsString()
  @MinLength(1)
  type: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @ApiPropertyOptional({
    example: {
      heal: 50,
      rarity: 'common',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
