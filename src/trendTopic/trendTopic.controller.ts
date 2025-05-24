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
  Req,
  UseGuards,
} from '@nestjs/common';
import { TrendTopicService } from './trendTopic.service';
import { CreateTrendTopicDto, UpdateTrendTopicDto } from './trendTopic.dto';
import { AuthenticatedRequest } from 'src/common/interface/authenticated-request.interface'; // Giả sử bạn có interface này
import { AuthGuard } from '@nestjs/passport';

@Controller('trendTopic')
export class TrendTopicController {
  constructor(private readonly trendTopicService: TrendTopicService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/create')
  async createTrendTopic(@Body() trendTopicData: CreateTrendTopicDto,
                         @Req() req: AuthenticatedRequest) {
    const role = req.user.role;
    if (role !== 'ADMIN') {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền tạo xu hướng',
      };
    }
    const trendTopic =
      await this.trendTopicService.createTrendTopic(trendTopicData);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tạo xu hướng thành công',
      data: trendTopic,
    };
  }

  @Patch('update/:id')
  async updateTrendTopic(
    @Param('id') id: string,
    @Body() trendTopicData: UpdateTrendTopicDto,
  ) {
    const trendTopic = await this.trendTopicService.updateTrendTopic(
      id,
      trendTopicData,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật xu hướng thành công',
      data: trendTopic,
    };
  }

  @Get()
  async getTrendTopics() {
    const trendTopics = await this.trendTopicService.getTrendTopics();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy toàn bộ xu hướng thành công',
      data: trendTopics,
    };
  }

  @Get(':id')
  async getTrendTopicById(@Param('id') id: string) {
    const trendTopic = await this.trendTopicService.getTrendTopicById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy xu hướng thành công',
      data: trendTopic,
    };
  }

  @Delete(':id')
  async deleteTrendTopicById(@Param('id') id: string) {
    await this.trendTopicService.deleteTrendTopicById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa xu hướng thành công',
    };
  }

  @Get('search')
  async searchTrendTopicByKeyword(@Query('keyword') keyword: string) {
    const trendTopics =
      await this.trendTopicService.searchTrendTopicByKeyword(keyword);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy xu hướng thành công',
      data: trendTopics,
    };
  }
}
