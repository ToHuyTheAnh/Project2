import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/db/prisma.service';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from './notification.dto';
import { Notification } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {}

  async createNotification(
    notificationData: CreateNotificationDto,
  ): Promise<Notification> {
    return this.prismaService.notification.create({
      data: {
        ...notificationData,
      },
    });
  }

  async updateNotification(
    id: string,
    notificationData: UpdateNotificationDto,
  ): Promise<Notification> {
    return this.prismaService.notification.update({
      where: { id },
      data: {
        ...notificationData,
      },
    });
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return await this.prismaService.notification.findMany({ where: { userId } });
  }

  async getNotificationById(id: string): Promise<Notification> {
    const notification = await this.prismaService.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Thông báo không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return notification;
  }

  async deleteNotificationById(id: string) {
    const notification = await this.prismaService.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Thông báo không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.prismaService.notification.delete({
      where: { id },
    });
  }
}
