import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/db/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
import { Comment } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async createComment(
    commentData: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const post = await this.prismaService.post.findUnique({
      where: { id: commentData.postId },
      include: {
        user: true,
      },
    });
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (post?.user?.id && post.user.id !== userId) {
      const notificationData = {
        userId: post.user.id,
        actor: user?.username || 'Người dùng',
        content: 'đã bình luận về bài đăng của bạn',
      };
      await this.prismaService.notification.create({
        data: notificationData,
      });
    }
    return await this.prismaService.comment.create({
      data: {
        ...commentData,
        userId,
      },
    });
  }

  async updateComment(
    id: string,
    commentData: UpdateCommentDto,
    userId: string,
  ): Promise<Comment> {
    return await this.prismaService.comment.update({
      where: { id },
      data: {
        ...commentData,
        userId,
      },
    });
  }

  async getComments(): Promise<Comment[]> {
    return this.prismaService.comment.findMany();
  }

  async getCommentById(id: string): Promise<Comment> {
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Bình luận không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return comment;
  }

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
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
    const comments = await this.prismaService.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });
    return comments;
  }

  async deleteCommentById(id: string) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Bình luận không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.prismaService.comment.delete({
      where: { id },
    });
  }
}
