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
import { NotificationService } from './notification.service';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from './notification.dto';

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

  @Get()
  async getNotifications() {
    const notifications = await this.notificationService.getNotifications();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy toàn bộ thông báo thành công',
      data: notifications,
    };
  }

  @Get('/:id')
  async getNotificationById(@Param('id') id: string) {
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
