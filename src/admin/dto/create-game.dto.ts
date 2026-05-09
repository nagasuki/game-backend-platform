import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateGameDto {
  @ApiProperty({ example: 'rpg-01' })
  @IsString()
  @MinLength(1)
  key: string;

  @ApiProperty({ example: 'RPG Demo' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: {
      genre: 'rpg',
      environment: 'prod',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
