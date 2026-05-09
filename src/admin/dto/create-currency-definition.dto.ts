import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCurrencyDefinitionDto {
  @ApiProperty({ example: 'rpg-01' })
  @IsString()
  @MinLength(1)
  gameKey: string;

  @ApiProperty({ example: 'gold' })
  @IsString()
  @MinLength(1)
  code: string;

  @ApiProperty({ example: 'Gold' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({
    example: {
      softCurrency: true,
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
