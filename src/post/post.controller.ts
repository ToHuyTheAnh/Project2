// src/post/post.controller.ts
import {
  Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query,
  UploadedFile, UseInterceptors, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator, // Thêm UploadedFiles nếu dùng FileFieldsInterceptor
  // Thêm FileFieldsInterceptor nếu cần upload cả ảnh và video
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // Hoặc FileFieldsInterceptor
import { Express } from 'express';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/create')
  @UseInterceptors(FileInterceptor('image')) // Chỉ nhận field 'image'
  async createPost(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false, // Không bắt buộc có file
      }),
    )
    file: Express.Multer.File | undefined, // file có thể là undefined
    @Body() postData: CreatePostDto
  ) {
    // TRUYỀN CẢ file VÀO SERVICE
    const post = await this.postService.createPost(postData, file);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tạo bài đăng thành công',
      data: post,
    };
  }

  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('image')) // Chỉ nhận field 'image'
  async updatePost(
    @Param('id') id: string,
    @Body() postData: UpdatePostDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false, // Không bắt buộc có file khi update
      }),
    )
    file?: Express.Multer.File // file có thể là undefined
  ) {
    // TRUYỀN CẢ file VÀO SERVICE
    const post = await this.postService.updatePost(id, postData, file);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật bài đăng thành công',
      data: post,
    };
  }

  // ... các phương thức khác giữ nguyên ...
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