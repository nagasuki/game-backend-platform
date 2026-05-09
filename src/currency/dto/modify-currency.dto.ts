import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class ModifyCurrencyDto {
  @ApiProperty({ example: 'rpg-01' })
  @IsString()
  @MinLength(1)
  gameKey: string;

  @ApiProperty({ example: 'gold' })
  @IsString()
  @MinLength(1)
  currencyCode: string;

  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount: number;
}
