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
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
import { UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from 'src/common/interface/authenticated-request.interface';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/create')
  async createComment(
    @Body() commentData: CreateCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    const comment = await this.commentService.createComment(
      commentData,
      userId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Bình luận thành công',
      data: comment,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update/:id')
  async updateComment(
    @Param('id') id: string,
    @Body() commentData: UpdateCommentDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const comment = await this.commentService.updateComment(id, commentData, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật bình luận thành công',
      data: comment,
    };
  }

  @Get()
  async getComments() {
    const comments = await this.commentService.getComments();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy toàn bộ bình luận thành công',
      data: comments,
    };
  }

  @Get(':id')
  async getCommentById(@Param('id') id: string) {
    const comment = await this.commentService.getCommentById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy bình luận thành công',
      data: comment,
    };
  }

  @Get('post-comments')
  async getCommentsByPostId(@Query('postId') postId: string) {
    const comments = await this.commentService.getCommentsByPostId(postId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy toàn bộ bình luận của bài đăng thành công',
      data: comments,
    };
  }

  @Delete(':id')
  async deleteCommentById(@Param('id') id: string) {
    await this.commentService.deleteCommentById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa bình luận thành công',
    };
  }
}
