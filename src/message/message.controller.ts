import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto, UpdateMessageDto } from './message.dto';
import { UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/create')
  async createMessage(@Body() messageData: CreateMessageDto, @Req() req) {
    const userId = req.user.id;
    const message = await this.messageService.createMessage(messageData, userId);
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
    @Req() req,
  ) {
    const userId = req.user.id;
    const message = await this.messageService.updateMessage(id, messageData, userId);
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
      message: 'Lấy toàn bộ tin nhắn thành công',
      data: messages,
    };
  }

  @Get('/chat')
  async getMessagesByChatBox(
    @Query('chatBoxId') chatBoxId: string,
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 20,
  ) {
    const messages = await this.messageService.getMessageByChatBox(
      chatBoxId,
      skip,
      limit,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy tin nhắn thành công',
      data: messages,
    };
  }

  @Get('/:id')
  async getMessageById(@Param('id') id: string) {
    const message = await this.messageService.getMessageById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy tin nhắn thành công',
      data: message,
    };
  }

  @Delete('/:id')
  async deleteMessageById(@Param('id') id: string) {
    await this.messageService.deleteMessageById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa tin nhắn thành công',
    };
  }
}
