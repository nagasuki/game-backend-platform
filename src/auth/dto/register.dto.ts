import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'testuser' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;
}
