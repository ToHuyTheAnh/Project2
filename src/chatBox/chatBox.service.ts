import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/db/prisma.service';
import { CreateChatBoxDto } from './chatBox.dto';
import { ChatBox } from '@prisma/client';

@Injectable()
export class ChatBoxService {
  constructor(private readonly prismaService: PrismaService) {}

  async createChatBox(chatBoxData: CreateChatBoxDto): Promise<ChatBox> {
    const { userIds } = chatBoxData;
    if (userIds.length !== 2) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Chatbox chỉ cho phép nhắn tin giữa 2 người',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.prismaService.chatBox.create({
      data: chatBoxData,
    });
  }

  async getChatBoxs(): Promise<ChatBox[]> {
    return this.prismaService.chatBox.findMany();
  }

  async getChatBoxById(id: string): Promise<ChatBox> {
    const chatBox = await this.prismaService.chatBox.findUnique({
      where: { id },
    });
    if (!chatBox) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Hộp thoại tin nhắn không tồn tại`,
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
          message: `Hộp thoại tin nhắn không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.prismaService.chatBox.delete({
      where: { id },
    });
  }
}
