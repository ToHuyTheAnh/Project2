import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto, UpdateMessageDto } from './message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
  @Post('/create')
  async createMessage(@Body() messageData: CreateMessageDto) {
    const message = await this.messageService.createMessage(messageData);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tạo tin nhắn thành công',
      data: message,
    };
  }

  @Patch('update/:id')
  async updateMessage(
    @Param('id') id: string,
    @Body() messageData: UpdateMessageDto,
  ) {
    const message = await this.messageService.updateMessage(id, messageData);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật tin nhắn thành công',
      data: message,
    };
  }

  @Get()
  async getMessages() {
    const messages = await this.messageService.getMessages();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy toàn bộ bình luận thành công',
      data: messages,
    };
  }

  @Get(':id')
  async getMessageById(@Param('id') id: string) {
    const message = await this.messageService.getMessageById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy tin nhắn thành công',
      data: message,
    };
  }

  @Delete(':id')
  async deleteMessageById(@Param('id') id: string) {
    await this.messageService.deleteMessageById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa tin nhắn thành công',
    };
  }
}
