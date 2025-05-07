import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Query,
  Patch,
  Post,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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

  @UseGuards(AuthGuard('jwt'))
  @Patch('update')
  async updateUser(
    @Req() req,
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
    const id = req.user.id;
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
  async getUsers() {
    const users = await this.userService.getUsers();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy toàn bộ users thành công',
      data: users,
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy user thành công',
      data: user,
    };
  }

  @Delete(':id')
  async deleteUserById(@Param('id') id: string) {
    await this.userService.deleteUserById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa user thành công',
    };
  }

  @Post('follow/:followingId')
  async followUser(
    @Query('followerId') followerId: string,
    @Param('followingId') followingId: string
  ) {
    const follow = await this.userService.followUser(followerId, followingId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Theo dõi thành công',
      data: follow,
    };
  }

  @Get('following/:id')
  async getFollowing(@Param('id') id: string) {
    const followings = await this.userService.getFollowing(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách người theo dõi thành công', 
      data: followings, 
    };
  }

  @Get('followers/:id')
  async getFollowers(@Param('id') id: string) {
    const followers = await this.userService.getFollowers(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách người theo dõi thành công',
      data: followers,
    };
  }
}