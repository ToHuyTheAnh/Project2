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
    @Body() postData: CreatePostDto
  ) {
    console.log('--- PostController ---');
    console.log('Received file:', file ? file.originalname : 'No file');
    console.log('Received postData:', postData); 

    if (!postData) {
       console.error('postData is undefined or null in Controller!');
    }


    const post = await this.postService.createPost(postData, file); 
    return {
      statusCode: HttpStatus.OK,
      message: 'Tạo bài đăng thành công',
      data: post,
    };
  }


  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('image')) 
  async updatePost(
      @Param('id') id: string,
      @Body() postData: UpdatePostDto,
      @UploadedFile(
         new ParseFilePipe({
            validators: [
               new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), 
               new FileTypeValidator({ fileType: 'image/*' }),
            ],
            fileIsRequired: false, 
         }),
      ) file?: Express.Multer.File 
   ) {
      const post = await this.postService.updatePost(id, postData, file); 
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
}
