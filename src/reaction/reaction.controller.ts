import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus, 
  HttpException, 
  Param,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './reaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from 'src/common/interface/authenticated-request.interface'; 

@Controller('reaction') // Đặt prefix route là 'reaction'
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @UseGuards(AuthGuard('jwt')) // Bảo vệ route, yêu cầu đăng nhập
  @Post('/create') // Endpoint để tạo hoặc cập nhật reaction
  async createOrUpdateReaction(
    @Body() reactionData: CreateReactionDto,
    @Req() req: AuthenticatedRequest, // Lấy thông tin user từ request đã được xác thực
  ) {
    const userId = req.user.userId; // Lấy userId từ payload của JWT
    const reaction = await this.reactionService.createOrUpdateReaction(
      reactionData,
      userId,
    );
    // Phản hồi về client
    return {
      statusCode: HttpStatus.OK,
      message: 'Thả cảm xúc thành công', // Hoặc 'Cập nhật cảm xúc thành công' tùy logic trong service
      data: reaction,
    };
  }

  @UseGuards(AuthGuard('jwt')) // Bảo vệ route
  @Delete('/delete') // Endpoint để xóa reaction, dùng postId từ query param
  async deleteReaction(
    @Query('postId') postId: string, // Lấy postId từ query parameter
    @Req() req: AuthenticatedRequest, // Lấy thông tin user
  ) {
    const userId = req.user.userId;
    // Kiểm tra postId có được cung cấp không
    if (!postId) {
       throw new HttpException( // Sử dụng HttpException đã import
        {
          statusCode: HttpStatus.BAD_REQUEST, // Sử dụng HttpStatus đã import
          message: `Thiếu tham số postId`,
        },
        HttpStatus.BAD_REQUEST, // Sử dụng HttpStatus đã import
      );
    }
    await this.reactionService.deleteReaction(postId, userId);
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
          statusCode: HttpStatus.BAD_REQUEST, // Sử dụng HttpStatus đã import
          message: `Thiếu tham số postId`,
        },
        HttpStatus.BAD_REQUEST, // Sử dụng HttpStatus đã import
      );
    }
    const reactions = await this.reactionService.getReactionsByPostId(postId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách cảm xúc của bài đăng thành công',
      data: reactions,
    };
  }
}
