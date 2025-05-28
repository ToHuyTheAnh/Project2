import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatBoxService } from './chatBox.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from 'src/common/interface/authenticated-request.interface';
import { CreateChatBoxDto } from './chatBox.dto';

@Controller('chatBox')
export class ChatBoxController {
  constructor(private readonly chatBoxService: ChatBoxService) {}
  @UseGuards(AuthGuard('jwt'))
  @Post('/create')
  async createChatBox(
    @Body() chatBoxData: CreateChatBoxDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    const { partnerId } = chatBoxData;
    const chatBox = await this.chatBoxService.createChatBox(userId, partnerId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tạo chatbox thành công',
      data: chatBox,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getChatBoxs(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    const chatBoxs = await this.chatBoxService.getChatBoxesByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Hiển thị toàn bộ chatbox của user thành công',
      data: chatBoxs,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/user/:id')
  async getChatBoxesByUserId(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    const chatBoxs = await this.chatBoxService.getChatBoxesByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Hiển thị toàn bộ chatbox của user thành công',
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
