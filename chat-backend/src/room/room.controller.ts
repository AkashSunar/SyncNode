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
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiCreatedResponse({ description: 'Room created' })
  create(@Body() dto: CreateRoomDto, @CurrentUser('id') userId: string) {
    return this.roomService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all rooms you belong to' })
  @ApiOkResponse({ description: 'List of rooms' })
  findAll(@CurrentUser('id') userId: string) {
    return this.roomService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room details' })
  @ApiOkResponse({ description: 'Room details' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.roomService.findOne(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  @ApiOkResponse({ description: 'Room deleted' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.roomService.remove(id, userId);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to a room' })
  @ApiCreatedResponse({ description: 'Member added' })
  addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.roomService.addMember(id, dto, userId);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove a member from a room' })
  @ApiOkResponse({ description: 'Member removed' })
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.roomService.removeMember(id, memberId, userId);
  }
}
