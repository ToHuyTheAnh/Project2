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

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @Post('/create')
  async createComment(@Body() commentData: CreateCommentDto) {
    const comment = await this.commentService.createComment(commentData);
    return {
      statusCode: HttpStatus.OK,
      message: 'Bình luận thành công',
      data: comment,
    };
  }

  @Patch('update/:id')
  async updateComment(
    @Param('id') id: string,
    @Body() commentData: UpdateCommentDto,
  ) {
    const comment = await this.commentService.updateComment(id, commentData);
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
