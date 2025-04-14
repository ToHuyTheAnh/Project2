import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/db/prisma.service';
import { CreateTrendTopicDto, UpdateTrendTopicDto } from './trendTopic.dto';
import { TrendTopic } from '@prisma/client';

@Injectable()
export class TrendTopicService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTrendTopic(
    trendTopicData: CreateTrendTopicDto,
  ): Promise<TrendTopic> {
    return this.prismaService.trendTopic.create({
      data: trendTopicData,
    });
  }

  async updateTrendTopic(
    id: string,
    trendTopicData: UpdateTrendTopicDto,
  ): Promise<TrendTopic> {
    return this.prismaService.trendTopic.update({
      where: { id },
      data: trendTopicData,
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
}
