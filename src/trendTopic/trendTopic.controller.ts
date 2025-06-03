import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TrendTopicService } from './trendTopic.service';
import { CreateTrendTopicDto, UpdateTrendTopicDto } from './trendTopic.dto';
import { AuthenticatedRequest } from 'src/common/interface/authenticated-request.interface'; // Giả sử bạn có interface này
import { AuthGuard } from '@nestjs/passport';
import * as fs from 'fs';
import * as path from 'path';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

const ensureDirExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'trendTopic-images');
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  },
});

@Controller('trendTopic')
export class TrendTopicController {
  constructor(private readonly trendTopicService: TrendTopicService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/create')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storage,
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
          cb(null, true);
        } else {
          cb(
            new HttpException('Chỉ chấp nhận file ảnh', HttpStatus.BAD_REQUEST),
            false,
          );
        }
      },
    }),
  )
  async createTrendTopic(
    @Body() trendTopicData: CreateTrendTopicDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /^(image\/(jpeg|png|gif|webp))$/,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    console.log('--- TrendTopicController ---');
    console.log(
      'Received file:',
      file ? `${file.originalname} (${file.mimetype})` : 'No file',
    );
    console.log('Received postData:', trendTopicData);
    const role = req.user.role;
    console.log(req.user);
    if (role !== 'Admin') {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền tạo xu hướng',
      };
    }
    const trendTopic = await this.trendTopicService.createTrendTopic(
      trendTopicData,
      file,
    );
    console.log('>> Sau khi gọi service');
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

  @Get('trend-ranking/:trendTopicId')
  async getTrendRankPoint(@Param('trendTopicId') trendTopicId: string) {
    const rank = await this.trendTopicService.getRankTrendPoint(trendTopicId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy BXH thành công',
      data: rank,
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

  @Get('search/:keyword')
  async searchTrendTopicByKeyword(@Param('keyword') keyword: string) {
    const trendTopics =
      await this.trendTopicService.searchTrendTopicByKeyword(keyword);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy xu hướng thành công',
      data: trendTopics,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('trendPoint/:trendTopicId')
  async getTrendPointByUserId(
    @Req() req: AuthenticatedRequest,
    @Param('trendTopicId') trendTopicId: string,
  ) {
    const userId = req.user.userId;
    const trendPoint = await this.trendTopicService.getTrendPointByUserId(
      trendTopicId,
      userId,
    );
    return trendPoint;
  }
}
