import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateGameDto {
  @ApiPropertyOptional({ example: 'RPG Demo Updated' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: {
      genre: 'rpg',
      season: 'season-2',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
