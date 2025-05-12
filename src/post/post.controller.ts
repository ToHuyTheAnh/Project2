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
  UseGuards, 
  Req,      
  HttpException, 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './post.dto';
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
    file?: Express.Multer.File, 
  ) {
    console.log('--- PostController ---');
    console.log('Received file:', file ? file.originalname : 'No file');
    console.log('Received postData:', postData);

    if (!postData) {
       console.error('postData is undefined or null in Controller!');
       throw new HttpException('Dữ liệu bài đăng không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    const userId = req.user.userId; 
    const post = await this.postService.createPost(postData, userId, file);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tạo bài đăng thành công',
      data: post,
    };
  }

  @UseGuards(AuthGuard('jwt')) 
  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updatePost(
      @Param('id') id: string,
      @Body() postData: UpdatePostDto,
      @Req() req: AuthenticatedRequest, 
      @UploadedFile(
         new ParseFilePipe({
            validators: [
               new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
               new FileTypeValidator({ fileType: 'image/*' }),
            ],
            fileIsRequired: false,
         }),
      ) file?: Express.Multer.File,
   ) {
      const userId = req.user.userId;
      const post = await this.postService.updatePost(id, postData, userId, file);
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
  @Get('user-posts/:userId') 
  async getPostsByUserId(@Param('userId') userId: string) {
    const posts = await this.postService.getPostsByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy toàn bộ bài đăng của user thành công',
      data: posts,
    };
  }

  @UseGuards(AuthGuard('jwt')) 
  @Delete(':id')
  async deletePostById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    await this.postService.deletePostById(id, userId /*, req.user.isAdmin */);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa bài đăng thành công',
    };
  }

  @Get('search') 
  async searchPostByKeyword(@Query('keyword') keyword: string) {
    if (!keyword || keyword.trim() === "") {
        throw new HttpException('Từ khóa tìm kiếm không được để trống', HttpStatus.BAD_REQUEST);
    }
    const posts = await this.postService.searchPostByKeyword(keyword);
    return {
      statusCode: HttpStatus.OK,
      message: `Kết quả tìm kiếm cho từ khóa "${keyword}"`,
      data: posts,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('share/:postId')
  async sharePost(
    @Param('postId') postId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    const result = await this.postService.userSharePost(postId, userId);
    return {
        statusCode: HttpStatus.OK,
        ...result 
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('unshare/:postId')
  async unsharePost(
    @Param('postId') postId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    await this.postService.userDeleteSharePost(postId, userId);
    return {
        statusCode: HttpStatus.OK,
        message: 'Hủy chia sẻ bài viết thành công'
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('shared/:userId') 
  async getSharedPosts(@Param('userId') userId: string /* @Req() req: AuthenticatedRequest */) {
    // const userId = req.user.userId; // Nếu muốn lấy bài của chính user đang đăng nhập
    const posts = await this.postService.getPostShareByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy bài viết đã chia sẻ thành công',
      data: posts,
    };
  }

  // --- Thêm API endpoint banPost ---
  /**
   * API endpoint để ban một bài đăng.
   * Chỉ có Admin mới có quyền thực hiện. (Cần implement RoleGuard)
   * @param id ID của bài đăng cần ban.
   */
  @Patch(':id/ban')
  @UseGuards(AuthGuard('jwt')) 
  // @Roles(UserRole.Admin) // Ví dụ nếu bạn có decorator @Roles và enum UserRole từ schema
  async banPost(@Param('id') id: string /*, @Req() req: AuthenticatedRequest */) {
    // const requestingUser = req.user; // Lấy thông tin admin thực hiện
    // Thêm logic kiểm tra quyền admin ở đây nếu chưa có RoleGuard
    const bannedPost = await this.postService.banPost(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Ban bài đăng thành công',
      data: bannedPost,
    };
  }
}
