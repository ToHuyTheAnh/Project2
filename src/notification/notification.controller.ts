import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from './notification.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from 'src/common/interface/authenticated-request.interface';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('/create')
  async createNotification(@Body() notificationData: CreateNotificationDto) {
    const notification =
      await this.notificationService.createNotification(notificationData);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tạo thông báo thành công',
      data: notification,
    };
  }

  @Patch('update/:id')
  async updateNotification(
    @Param('id') id: string,
    @Body() notificationData: UpdateNotificationDto,
  ) {
    const notification = await this.notificationService.updateNotification(
      id,
      notificationData,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật thông báo thành công',
      data: notification,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/user')
  async getNotifications(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    const notifications =
      await this.notificationService.getNotificationsByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy toàn bộ thông báo thành công',
      data: notifications,
    };
  }

  @Get('/:id')
  async getNotificationByUserId(@Param('id') id: string) {
    const notification = await this.notificationService.getNotificationById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông báo thành công',
      data: notification,
    };
  }

  @Delete('/:id')
  async deleteNotificationById(@Param('id') id: string) {
    await this.notificationService.deleteNotificationById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa thông báo thành công',
    };
  }
}
