import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/db/prisma.service';
import { ChatBox } from '@prisma/client';

@Injectable()
export class ChatBoxService {
  constructor(private readonly prismaService: PrismaService) {}

  async createChatBox(userId: string, partnerId: string): Promise<ChatBox> {
    const participantIds = [userId, partnerId];
    if (userId === partnerId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Không thể tạo chatBox với bản thân`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const chatBox = await this.prismaService.chatBox.findFirst({
      where: {
        users: {
          every: {
            id: { in: participantIds },
          },
        },
      },
      include: { users: true },
    });

    if (chatBox) {
      return chatBox;
    }
    return this.prismaService.chatBox.create({
      data: {
        users: {
          connect: participantIds.map((id) => ({ id })),
        },
      },
    });
  }

  async getChatBoxesByUserId(userId: string): Promise<ChatBox[]> {
    return this.prismaService.chatBox.findMany({
      where: {
        users: { some: { id: userId } },
      },
      include: { users: true, messages: true },
    });
  }

  async getChatBoxById(id: string): Promise<ChatBox> {
    const chatBox = await this.prismaService.chatBox.findUnique({
      where: { id },
      include: { messages: true },
    });
    if (!chatBox) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Chatbox không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return chatBox;
  }

  async deleteChatBoxById(id: string) {
    const chatBox = await this.prismaService.chatBox.findUnique({
      where: { id },
    });
    if (!chatBox) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Chatbox không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.prismaService.chatBox.delete({
      where: { id },
    });
  }
}
