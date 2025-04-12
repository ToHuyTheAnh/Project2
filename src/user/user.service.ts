import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/db/prisma.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from '@prisma/client';

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
      throw new Error('Không thể theo dõi chính mình.');
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

      return { message: 'Đã hủy theo dõi!!!' };
    }

    await this.prismaService.userFollow.create({
      data: {
        followerId,
        followingId,
      },
    });

    return { massage: 'Theo dõi thành công!!!' };
  }

  // lấy ra tất cả những người mình follow.
  async getFollowing(userId: string) {
    const followings = await this.prismaService.userFollow.findMany({
      where: { followerId: userId },
      select: { following: true },
    });

    if (followings.length === 0) {
      return { message: 'Không có ai theo dõi bạn!!!' };
    }

    return followings;
  }

  // lấy ra tất cả những người follow mình.
  async getFollowers(userId: string) {
    const followers = await this.prismaService.userFollow.findMany({
      where: { followingId: userId },
      select: { follower: true },
    });

    if (followers.length === 0) {
      return { message: 'Bạn không theo dõi người khác!!!' };
    }

    return followers;
  }
}
