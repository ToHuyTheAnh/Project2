import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards, // <<< Thêm UseGuards
  Req, // <<< Thêm Req
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// import { UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { AuthGuard } from '@nestjs/passport'; // <<< Thêm AuthGuard
import { AuthenticatedRequest } from 'src/common/interface/authenticated-request.interface'; // Giả sử bạn có interface này

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  async createUser(@Body() userData: CreateUserDto) {
    const user = await this.userService.createUser(userData);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tạo user thành công',
      data: user,
    };
  }

  @Patch('update')
  @UseGuards(AuthGuard('jwt')) // user moới có thể cập nhật thông tin của chính mình
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(
    @Req() req: AuthenticatedRequest,
    @Body() userData: UpdateUserDto,
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
    const id = req.user.userId;
    if (file) {
      userData.avatar = `/uploads/user-images/${file.filename}`;
    }
    const user = await this.userService.updateUser(id, userData);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật user thành công',
      data: user,
    };
  }

  @Get()
  // @UseGuards(AuthGuard('jwt')) // Cân nhắc bảo vệ route này nếu không phải public
  async getUsers() {
    const users = await this.userService.getUsers();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy toàn bộ users thành công',
      data: users,
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    const data = await this.userService.getProfile(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin người dùng thành công',
      data: data,
    };
  }

  @Get('search')
  @UseGuards(AuthGuard('jwt'))
  async searchUsers(
    @Req() req: AuthenticatedRequest,
    @Query('keyword') keyword: string,
  ) {
    const userId = req.user.userId;
    const users = await this.userService.searchUser(userId, keyword);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tìm kiếm users thành công',
      data: users,
    };
  }

  @Get(':id')
  // @UseGuards(AuthGuard('jwt')) // Cân nhắc bảo vệ route này
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy user thành công',
      data: user,
    };
  }

  @Delete(':id')
  // @UseGuards(AuthGuard('jwt')) // Cần bảo vệ route này, và kiểm tra quyền (admin)
  async deleteUserById(@Param('id') id: string) {
    await this.userService.deleteUserById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa user thành công',
    };
  }

  @UseGuards(AuthGuard('jwt')) // Bảo vệ route này
  @Post('follow/:followingId')
  async followUser(
    // @Query('followerId') followerId: string, // Nên lấy followerId từ user đã xác thực
    @Req() req: AuthenticatedRequest,
    @Param('followingId') followingId: string,
  ) {
    const followerId = req.user.userId; // Lấy userId của người thực hiện hành động
    const result = await this.userService.followUser(followerId, followingId);
    return {
      statusCode: HttpStatus.OK,
      // message: 'Thao tác theo dõi/hủy theo dõi thành công', // Thông báo chung hơn
      data: result,
    };
  }

  @Get('following/:userId')
  // @UseGuards(AuthGuard('jwt')) // Cân nhắc bảo vệ nếu cần
  async getFollowing(@Param('userId') userId: string) {
    const followings = await this.userService.getFollowing(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách người đang theo dõi thành công',
      data: followings,
    };
  }

  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: string) {
    const followers = await this.userService.getFollowers(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách người theo dõi thành công',
      data: followers,
    };
  }

  // --- Thêm API endpoint banUser ---
  /**
   * API endpoint để ban một tài khoản người dùng.
   * Chỉ có Admin mới có quyền thực hiện. (Cần implement RoleGuard)
   * @param id ID của người dùng cần ban.
   */
  @Patch(':id/ban')
  @UseGuards(AuthGuard('jwt'))
  // @Roles(UserRole.Admin) // Ví dụ nếu bạn có decorator @Roles và enum UserRole
  async banUser(@Param('id') id: string) {
    // const requestingUser = req.user; // Lấy thông tin admin thực hiện
    // Thêm logic kiểm tra quyền admin ở đây nếu chưa có RoleGuard
    const bannedUser = await this.userService.banUser(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Ban tài khoản thành công',
      data: bannedUser,
    };
  }
}
