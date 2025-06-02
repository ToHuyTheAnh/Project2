import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/db/prisma.service';
import { CreateTrendTopicDto, UpdateTrendTopicDto } from './trendTopic.dto';
import { TrendTopic, UserTrendPoint } from '@prisma/client';
import * as path from 'path';

@Injectable()
export class TrendTopicService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTrendTopic(
    trendTopicData: CreateTrendTopicDto,
    file?: Express.Multer.File,
  ): Promise<TrendTopic> {
    try {
      console.log('==> [Backend] Nhận DTO:', trendTopicData);
      console.log('==> [Backend] Nhận file:', file);
      const dataToSave: any = {
        ...trendTopicData,
        imageUrl: trendTopicData.imageUrl || null,
      };
      if (file) {
        const relativePath = file.path
          .substring(file.path.indexOf(path.join('uploads')))
          .replace(/\\/g, '/');
        const finalUrl = `/${relativePath}`;

        if (file.mimetype.startsWith('image')) {
          dataToSave.imageUrl = finalUrl;
          dataToSave.videoUrl = null;
          console.log(`Saving image URL: ${finalUrl}`);
        }
      }
      delete dataToSave.videoUrl;
      console.log('==> [Backend] Dữ liệu sẽ lưu vào DB:', dataToSave);
      return await this.prismaService.trendTopic.create({
        data: dataToSave,
      });
    } catch (error) {
      console.error('Error creating TrendTopic:', error);

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Không thể tạo xu hướng',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateTrendTopic(
    id: string,
    trendTopicData: UpdateTrendTopicDto,
  ): Promise<TrendTopic> {
    return this.prismaService.trendTopic.update({
      where: { id },
      data: { ...trendTopicData },
    });
  }

  async getTrendTopics(): Promise<TrendTopic[]> {
    return this.prismaService.trendTopic.findMany();
  }

  async getTrendTopicById(id: string): Promise<TrendTopic> {
    const trendTopic = await this.prismaService.trendTopic.findUnique({
      where: { id },
    });
    if (!trendTopic) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Xu hướng không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return trendTopic;
  }

  async deleteTrendTopicById(id: string) {
    const trendTopic = await this.prismaService.trendTopic.findUnique({
      where: { id },
    });
    if (!trendTopic) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Xu hướng không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.prismaService.trendTopic.delete({
      where: { id },
    });
  }

  async searchTrendTopicByKeyword(keyword: string) {
    const trendTopics = await this.prismaService.trendTopic.findMany({
      where: {
        OR: [{ title: { contains: keyword } }],
      },
    });

    if (trendTopics.length === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy xu hướng phù hợp',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return trendTopics;
  }

  async getRankTrendPoint(trendTopicId: string){
    const rankTrend = await this.prismaService.userTrendPoint.findMany({
      where :{
        trendTopicId: trendTopicId
      },
      include :{
        user: true
      },
      orderBy: {
        point: 'desc',
      },
      take: 3
    });
    return rankTrend;
  }
}
