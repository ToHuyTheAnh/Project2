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
import { UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from 'src/common/interface/authenticated-request.interface';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/create')
  @UseInterceptors(FileInterceptor('image'))
  async createPost(
    @Body() postData: CreatePostDto,
    @Req() req: AuthenticatedRequest,
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

  @UseGuards(AuthGuard('jwt'))
  @Get('user-posts')
  async getPostsByUserId(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
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
  @UseGuards(AuthGuard('jwt'))
  @Post('share/:postId')
  async sharePost(
    @Param('postId') postId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    return this.postService.UserSharePost(postId, userId);
  }

  // Hủy chia sẻ bài viết
  @UseGuards(AuthGuard('jwt'))
  @Delete('unshare/:postId')
  async unsharePost(
    @Param('postId') postId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    await this.postService.UserDeleteSharePost(postId, userId);
  }

  // Lấy danh sách bài viết đã chia sẻ của user
  @UseGuards(AuthGuard('jwt'))
  @Get('shared')
  async getSharedPosts(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    const posts = await this.postService.getPostShareByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy bài viết đã chia sẻ thành công',
      data: posts,
    };
  }
}
