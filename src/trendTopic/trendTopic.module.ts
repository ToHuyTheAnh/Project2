import { Module } from '@nestjs/common';
import { TrendTopicService } from './trendTopic.service';
import { TrendTopicController } from './trendTopic.controller';
import { PrismaModule } from 'src/db/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TrendTopicService],
  controllers: [TrendTopicController],
})
export class TrendTopicModule {}
