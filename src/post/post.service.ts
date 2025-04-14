import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/db/prisma.service';
import { CreatePostDto, UpdatePostDto } from './post.dto';
import { Post } from '@prisma/client';
import { Express } from 'express';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPost(postData: CreatePostDto, file?: Express.Multer.File): Promise<Post> {
    let imageUrl = postData.imageUrl;
    if(file) {
      imageUrl = `/uploads/post-images/${file.filename}`; // Đường dẫn đến file đã lưu
    }
    const dataToSave = {...postData, imageUrl };
    delete dataToSave.imageUrl; // Xóa trường imageUrl khỏi postData để không bị lưu trùng

    return this.prismaService.post.create({
      data: postData,
    });
  }

  async updatePost(id: string, postData: UpdatePostDto, file?: Express.Multer.File): Promise<Post> {
    let imageUrl = postData.imageUrl; // Giữ nguyên imageUrl cũ nếu không có file mới
    
    if (file) {
      // TODO: Xóa file cũ nếu cần (trước khi cập nhật DB)
      // const post = await this.getPostById(id);
      // if (post && post.imageUrl) { /* Xóa file tại post.imageUrl */ }

      imageUrl = `/uploads/post-images/${file.filename}`;
    }
    const dataToUpdate = { ...postData, imageUrl };
    delete dataToUpdate.imageUrl;

    return this.prismaService.post.update({
      where: { id },
      data: postData,
    });
  }

  async getPosts(): Promise<Post[]> {
    return this.prismaService.post.findMany();
  }

  async getPostById(id: string): Promise<Post> {
    const post = await this.prismaService.post.findUnique({
      where: { id },
    });
    if (!post) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Bài đăng không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return post;
  }

  async getPostsByUserId(userId: string): Promise<Post[]> {
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
    const posts = await this.prismaService.post.findMany({
      where: { userId },
    });
    return posts;
  }

  async deletePostById(id: string) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
    });
    if (!post) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Bài đăng không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.prismaService.post.delete({
      where: { id },
    });
  }

  async searchPostByKeyword(keyword: string) {
    const posts = await this.prismaService.post.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      },
    });

    if (posts.length === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy bài viết nào phù hợp',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return posts;
  }
}
