import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCurrencyDefinitionDto {
  @ApiPropertyOptional({ example: 'Premium Gem' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({
    example: {
      premiumCurrency: true,
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
