import { IsString, MinLength, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: 'general', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: ['user2@example.com'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberEmails?: string[];
}
