import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  HttpException,
  Post,
  Query,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './reaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from 'src/common/interface/authenticated-request.interface';

@Controller('reaction') // Đặt prefix route là 'reaction'
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/create')
  async createOrUpdateReaction(
    @Body() reactionData: CreateReactionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    const reaction = await this.reactionService.createOrUpdateReaction(
      userId,
      reactionData.postId,
      reactionData.type,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Thả cảm xúc thành công',
      data: reaction,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/delete')
  async deleteReaction(
    @Query('postId') postId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    if (!postId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Thiếu tham số postId`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.reactionService.deleteReaction(userId, postId);
    // Phản hồi về client
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa cảm xúc thành công',
    };
  }

  // Endpoint để lấy tất cả reactions của một bài đăng (không cần xác thực)
  @Get('/post')
  async getReactionsByPostId(@Query('postId') postId: string) {
    if (!postId) {
      throw new HttpException( // Sử dụng HttpException đã import
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Thiếu tham số postId`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const reactions = await this.reactionService.getReactionsByPostId(postId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách cảm xúc của bài đăng thành công',
      data: reactions,
    };
  }

  @Get(':postId/me')
  @UseGuards(AuthGuard('jwt'))
  async getUserReactionsByPostId(
    @Req() req: AuthenticatedRequest,
    @Param('postId') postId: string,
  ) {
    const userId = req.user.userId;
    if (!postId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Thiếu tham số postId`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const reactions = await this.reactionService.getReactionsByUserId(
      userId,
      postId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách cảm xúc của người dùng theo bài đăng thành công',
      data: reactions,
    };
  }
}
