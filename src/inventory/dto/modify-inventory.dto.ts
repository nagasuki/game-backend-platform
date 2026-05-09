import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class ModifyInventoryDto {
  @ApiProperty({ example: 'rpg-01' })
  @IsString()
  @MinLength(1)
  gameKey: string;

  @ApiProperty({ example: 'potion_small' })
  @IsString()
  @MinLength(1)
  itemCode: string;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
