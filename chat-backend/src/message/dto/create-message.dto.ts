import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ example: 'Hello everyone!' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
