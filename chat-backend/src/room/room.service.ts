import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoomDto, userId: string) {
    const room = await this.prisma.room.create({
      data: {
        name: dto.name,
        members: {
          create: { userId },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, username: true, email: true } } },
        },
      },
    });

    if (dto.memberEmails?.length) {
      await this.addMembersByEmail(room.id, dto.memberEmails);
    }

    return this.findOne(room.id, userId);
  }

  async findAll(userId: string) {
    return this.prisma.room.findMany({
      where: { members: { some: { userId } } },
      include: {
        _count: { select: { members: true, messages: true } },
        members: {
          include: { user: { select: { id: true, username: true, email: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findAllRooms() {
    return this.prisma.room.findMany({
      include: {
        _count: { select: { members: true, messages: true } },
        members: {
          include: { user: { select: { id: true, username: true, email: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, username: true, email: true } } },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const isMember = room.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this room');
    }

    return room;
  }

  async remove(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    await this.prisma.room.delete({ where: { id } });
  }

  async addMember(roomId: string, dto: AddMemberDto) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const alreadyMember = room.members.some((m) => m.userId === user.id);
    if (alreadyMember) {
      return this.findOne(roomId, user.id);
    }

    await this.prisma.roomMember.create({
      data: { roomId, userId: user.id },
    });

    return this.findOne(roomId, user.id);
  }

  async removeMember(roomId: string, memberId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const target = room.members.find((m) => m.userId === memberId);
    if (!target) {
      throw new NotFoundException('Member not found');
    }

    await this.prisma.roomMember.delete({
      where: { roomId_userId: { roomId, userId: memberId } },
    });
  }

  async leave(roomId: string, userId: string) {
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

    await this.prisma.roomMember.delete({
      where: { roomId_userId: { roomId, userId } },
    });
  }

  private async addMembersByEmail(roomId: string, emails: string[]) {
    const users = await this.prisma.user.findMany({
      where: { email: { in: emails } },
    });

    const existingMembers = await this.prisma.roomMember.findMany({
      where: { roomId, userId: { in: users.map((u) => u.id) } },
    });

    const existingUserIds = new Set(existingMembers.map((m) => m.userId));

    const newMembers = users
      .filter((u) => !existingUserIds.has(u.id))
      .map((u) => ({ roomId, userId: u.id }));

    if (newMembers.length) {
      await this.prisma.roomMember.createMany({ data: newMembers });
    }
  }
}
