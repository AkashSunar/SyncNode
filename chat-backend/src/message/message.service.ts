import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(roomId: string, dto: CreateMessageDto, senderId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const isMember = room.members.some((m) => m.userId === senderId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this room');
    }

    return this.prisma.message.create({
      data: { content: dto.content, senderId, roomId },
      include: {
        sender: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async findByRoom(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const isMember = room.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this room');
    }

    return this.prisma.message.findMany({
      where: { roomId },
      include: {
        sender: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, username: true, email: true } },
        room: { select: { id: true, name: true } },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const room = await this.prisma.room.findUnique({
      where: { id: message.roomId },
      include: { members: true },
    });

    const isMember = room?.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this room');
    }

    return message;
  }

  async update(id: string, dto: CreateMessageDto, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    return this.prisma.message.update({
      where: { id },
      data: { content: dto.content },
      include: {
        sender: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async remove(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.delete({ where: { id } });
  }
}
