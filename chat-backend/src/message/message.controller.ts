import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Send a message in a room' })
  @ApiCreatedResponse({ description: 'Message sent' })
  create(
    @Param('roomId') roomId: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.messageService.create(roomId, dto, userId);
  }

  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Get all messages in a room' })
  @ApiOkResponse({ description: 'List of messages' })
  findByRoom(@Param('roomId') roomId: string, @CurrentUser('id') userId: string) {
    return this.messageService.findByRoom(roomId, userId);
  }

  @Get('messages/:id')
  @ApiOperation({ summary: 'Get a single message' })
  @ApiOkResponse({ description: 'Message details' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.messageService.findOne(id, userId);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete your own message' })
  @ApiOkResponse({ description: 'Message deleted' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.messageService.remove(id, userId);
  }
}
