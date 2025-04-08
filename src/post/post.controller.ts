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
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}
  @Post('/create')
  async createPost(@Body() postData: CreatePostDto) {
    const post = await this.postService.createPost(postData);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tạo bài đăng thành công',
      data: post,
    };
  }

  @Patch('update/:id')
  async updatePost(@Param('id') id: string, @Body() postData: UpdatePostDto) {
    const post = await this.postService.updatePost(id, postData);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật bài đăng thành công',
      data: post,
    };
  }

  @Get()
  async getPosts() {
    const posts = await this.postService.getPosts();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy toàn bộ bài đăng thành công',
      data: posts,
    };
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.postService.getPostById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy bài đăng thành công',
      data: post,
    };
  }

  @Get('user-posts')
  async getPostsByUserId(@Query('userId') userId: string) {
    const posts = await this.postService.getPostsByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy toàn bộ bài đăng của user thành công',
      data: posts,
    };
  }

  @Delete(':id')
  async deletePostById(@Param('id') id: string) {
    await this.postService.deletePostById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa bài đăng thành công',
    };
  }
}
