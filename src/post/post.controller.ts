// src/post/post.controller.ts

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
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/create')
  @UseInterceptors(FileInterceptor('image'))
  async createPost(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File | undefined,
    @Body() postData: CreatePostDto,
  ) {
    // --- DEBUGGING STEP ---
    console.log('--- PostController ---');
    console.log('Received file:', file ? file.originalname : 'No file');
    console.log('Received postData:', postData); // <-- Add this log
    // --- END DEBUGGING STEP ---

    // Check if postData is undefined BEFORE calling the service
    if (!postData) {
      console.error('postData is undefined or null in Controller!');
      // You might want to throw an error here or handle it appropriately
      // throw new BadRequestException('Post data is missing');
    }

    const post = await this.postService.createPost(postData, file); // Line 43 (approx)
    return {
      statusCode: HttpStatus.OK,
      message: 'Tạo bài đăng thành công',
      data: post,
    };
  }

  // Other methods remain the same...

  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('image')) // Add interceptor for update too if needed
  async updatePost(
    @Param('id') id: string,
    @Body() postData: UpdatePostDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false, // Important if updating without changing image
      }),
    )
    file?: Express.Multer.File, // Make file optional here too
  ) {
    // Pass file to update service as well
    const post = await this.postService.updatePost(id, postData, file); // Pass file here
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

  @Get('search')
  async searchPostByKeyword(@Query('keyword') keyword: string) {
    const posts = await this.postService.searchPostByKeyword(keyword);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy bài đăng thành công',
      data: posts,
    };
  }

  // Chia sẻ bài viết
  @Post('share/:postId')
  async sharePost(
    @Param('postId') postId: string,
    @Query('userId') userId: string,
  ) {
    return this.postService.UserSharePost(postId, userId);
  }

  // Hủy chia sẻ bài viết
  @Delete('unshare/:postId')
  async unsharePost(
    @Param('postId') postId: string,
    @Query('userId') userId: string,
  ) {
    await this.postService.UserDeleteSharePost(postId, userId);
  }

  // Lấy danh sách bài viết đã chia sẻ của user
  @Get('shared')
  async getSharedPosts(@Query('userId') userId: string) {
    const posts = await this.postService.getPostShareByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy bài viết đã chia sẻ thành công',
      data: posts,
    };
  }

}
