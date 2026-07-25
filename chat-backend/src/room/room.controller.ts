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
import { AdminGuard } from '../common/guards/admin.guard';
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
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '[Admin] Create a new room' })
  @ApiCreatedResponse({ description: 'Room created' })
  create(@Body() dto: CreateRoomDto, @CurrentUser('id') userId: string) {
    return this.roomService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List rooms I belong to' })
  @ApiOkResponse({ description: 'List of rooms' })
  findAll(@CurrentUser('id') userId: string) {
    return this.roomService.findAll(userId);
  }

  @Get('all')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '[Admin] List all rooms' })
  @ApiOkResponse({ description: 'All rooms' })
  findAllRooms() {
    return this.roomService.findAllRooms();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room details' })
  @ApiOkResponse({ description: 'Room details' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.roomService.findOne(id, userId);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '[Admin] Delete a room' })
  @ApiOkResponse({ description: 'Room deleted' })
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }

  @Post(':id/members')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '[Admin] Add a member to a room' })
  @ApiCreatedResponse({ description: 'Member added' })
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.roomService.addMember(id, dto);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave a room' })
  @ApiOkResponse({ description: 'Left the room' })
  leave(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.roomService.leave(id, userId);
  }

  @Delete(':id/members/:memberId')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '[Admin] Remove a member from a room' })
  @ApiOkResponse({ description: 'Member removed' })
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string) {
    return this.roomService.removeMember(id, memberId);
  }
}
