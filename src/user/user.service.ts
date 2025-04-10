import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/db/prisma.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from '@prisma/client';
import e from 'express';

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
  
    const existingFollow = await this.prismaService.following.findFirst({
      where: {
        followerId,
        followingId,
      },
    });
  
    if (existingFollow) {
      await this.prismaService.following.delete({
        where: {id: existingFollow.id}
      });

      return {message :"Đã hủy theo dõi!!!"}
    }
    
    await this.prismaService.following.create({
      data: {
        followerId,
        followingId,
      }
    });

    return {massage: "Theo dõi thành công!!!"};
  }

  // lấy ra tất cả những người mình follow.
  async getFollowing(UserId: string){
    const following = await this.prismaService.following.findMany({
      where: {followerId: UserId},
      include : {Following: true}
    });

    if(!following){
      return {message: "Không có ai theo dõi bạn!!!"}
    }

    return following;
  }
  
  // lấy ra tất cả những người follow mình.
  async getFollowers(UserId: string){
    const followers = await this.prismaService.following.findMany({
      where: {followingId: UserId},
      include : {Followers: true}
    })

    if(!followers){
      return {message: "Bạn không theo dõi người khác!!!"}
    }

    return followers;
  }
}
