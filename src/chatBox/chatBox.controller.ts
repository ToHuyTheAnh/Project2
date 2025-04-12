import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ChatBoxService } from './chatBox.service';
import { CreateChatBoxDto } from './chatBox.dto';

@Controller('chatBox')
export class ChatBoxController {
  constructor(private readonly chatBoxService: ChatBoxService) {}
  @Post('/create')
  async createChatBox(@Body() chatBoxData: CreateChatBoxDto) {
    const chatBox = await this.chatBoxService.createChatBox(chatBoxData);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tạo chatbox thành công',
      data: chatBox,
    };
  }

  @Get()
  async getChatBoxs() {
    const chatBoxs = await this.chatBoxService.getChatBoxs();
    return {
      statusCode: HttpStatus.OK,
      message: 'Hiển thị toàn bộ chatbox thành công',
      data: chatBoxs,
    };
  }

  @Get(':id')
  async getChatBoxById(@Param('id') id: string) {
    const chatBox = await this.chatBoxService.getChatBoxById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Hiển thị chatbox thành công',
      data: chatBox,
    };
  }

  @Delete(':id')
  async deleteChatBoxById(@Param('id') id: string) {
    await this.chatBoxService.deleteChatBoxById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa chatbox thành công',
    };
  }
}
