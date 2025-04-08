import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/db/prisma.service';
import { CreateMessageDto, UpdateMessageDto } from './message.dto';
import { Message } from '@prisma/client';

@Injectable()
export class MessageService {
  constructor(private readonly prismaService: PrismaService) {}

  async createMessage(messageData: CreateMessageDto): Promise<Message> {
    return this.prismaService.message.create({
      data: messageData,
    });
  }

  async updateMessage(
    id: string,
    messageData: UpdateMessageDto,
  ): Promise<Message> {
    return this.prismaService.message.update({
      where: { id },
      data: messageData,
    });
  }

  async getMessages(): Promise<Message[]> {
    return this.prismaService.message.findMany();
  }

  async getMessageById(id: string): Promise<Message> {
    const message = await this.prismaService.message.findUnique({
      where: { id },
    });
    if (!message) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Bình luận không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return message;
  }

  async deleteMessageById(id: string) {
    const message = await this.prismaService.message.findUnique({
      where: { id },
    });
    if (!message) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Bình luận không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.prismaService.message.delete({
      where: { id },
    });
  }
}
