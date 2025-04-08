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
}
