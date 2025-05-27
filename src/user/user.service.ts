import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User, UserStatus } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({
      data: userData,
    });
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data: userData,
    });
  }

  async getUsers(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async deleteUserById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.prismaService.user.delete({
      where: { id },
    });
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new HttpException(
        'Không thể theo dõi chính mình.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingFollow = await this.prismaService.userFollow.findFirst({
      where: {
        followerId,
        followingId,
      },
    });

    if (existingFollow) {
      await this.prismaService.userFollow.delete({
        where: { id: existingFollow.id },
      });
      return { message: 'Đã hủy theo dõi!' }; // Sửa chính tả
    }
    const follower = await this.prismaService.user.findUnique({
      where: { id: followerId },
    });
    const notificationData = {
      userId: followingId,
      actor: follower?.username || 'Người dùng',
      content: 'đã theo dõi bạn',
    };
    await this.prismaService.notification.create({
      data: notificationData,
    });

    await this.prismaService.userFollow.create({
      data: {
        followerId,
        followingId,
      },
    });
    return { message: 'Theo dõi thành công!' }; // Sửa chính tả
  }

  async getFollowing(userId: string) {
    const followings = await this.prismaService.userFollow.findMany({
      where: { followerId: userId },
      select: { following: true },
    });

    // if (!followings || followings.length === 0) { // Kiểm tra mảng rỗng
    //   return { message: "Bạn chưa theo dõi ai!" };
    // }
    return followings.map((f) => f.following);
  }

  async getFollowers(userId: string) {
    const followers = await this.prismaService.userFollow.findMany({
      where: { followingId: userId },
      select: { follower: true },
    });

    // if (!followers || followers.length === 0) { // Kiểm tra mảng rỗng
    //   return { message: "Chưa có ai theo dõi bạn!" };
    // }
    return followers.map((f) => f.follower);
  }

  // --- Thêm phương thức banUser ---
  /**
   * Ban một tài khoản người dùng.
   * @param userId ID của người dùng cần ban.
   * @returns Thông tin người dùng đã được cập nhật.
   */
  async banUser(userId: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Kiểm tra nếu user đã bị ban rồi thì không cần cập nhật nữa (tùy chọn)
    if (user.status === UserStatus.Banned) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `User này đã bị ban trước đó.`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prismaService.user.update({
      where: { id: userId },
      data: { status: UserStatus.Banned }, // Sử dụng enum UserStatus
    });
  }
  // --- Kết thúc phương thức banUser ---

  // Lấy thông tin người dùng
  async getProfile(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        username: true,
        email: true,
        displayName: true,
        avatar: true,
        bio: true,
        hometown: true,
        school: true,
      },
    });

    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const followers = await this.prismaService.userFollow.findMany({
      where: { followingId: id },
      select: { follower: true },
    });
    const followings = await this.prismaService.userFollow.findMany({
      where: { followerId: id },
      select: { following: true },
    });

    return {
      user,
      followers: followers.map((f) => f.follower),
      followings: followings.map((f) => f.following),
    };
  }

  async searchUser(userId: string, keyword: string): Promise<User[]> {
    const formatKeyWord = keyword
      .normalize('NFD') // Tách dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, '') // Xoá dấu
      .replace(/\s+/g, ' ') // Chuẩn hóa khoảng trắng
      .trim(); // Xoá trắng đầu/cuối
    if (!formatKeyWord) return [];
    const users = await this.prismaService.user.findMany({
      where: {
        id: { not: userId },
        displayName: { contains: formatKeyWord },
      },
    });
    return users;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prismaService.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    return !!follow;
  }

  async getUserFriend(userId: string) {
    const followings = await this.prismaService.userFollow.findMany({   
      where: { followerId: userId },
      select: { following: true },
    });
    if (!followings || followings.length === 0) {
      return []; 
    }
    const followingIds = followings.map((f) => f.following.id);

    const friendChecks = await Promise.all(
      followingIds.map(async (followingId) => {
        const isFriend = await this.isFollowing(followingId, userId);
        return isFriend ? followingId : null;
      })
    );

    const friendIds = friendChecks.filter((id) => id !== null);

    return this.prismaService.user.findMany({
      where: {
        id: { in: friendIds },
      },
    });
  }
}
