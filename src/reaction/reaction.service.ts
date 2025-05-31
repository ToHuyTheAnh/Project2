import { Injectable } from '@nestjs/common';
import { ReactionType } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class ReactionService {
  constructor(private readonly prismaService: PrismaService) {}
  async createOrUpdateReaction(
    userId: string,
    postId: string,
    reactionType: ReactionType,
  ) {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
      include: {
        user: true,
      },
    });
    const existingReaction = await this.prismaService.reaction.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });
    const reaction = await this.prismaService.reaction.upsert({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      create: {
        userId,
        postId,
        type: reactionType || ReactionType.LIKE,
      },
      update: {
        type: reactionType || ReactionType.LIKE,
      },
    });
    if (!existingReaction && post?.user?.id && post.user.id !== userId) {
            const user = await this.prismaService.user.findUnique({
                where: { id: userId },
            });

            await this.prismaService.notification.create({
                data: {
                    userId: post.user.id,
                    actor: user?.username || 'Người dùng',
                    content: `đã bày tỏ cảm xúc bài đăng của bạn`,
                },
            });

            const updatedUser = await this.prismaService.user.update({
                where: { id: post.user.id },
                data: { point: { increment: 1 } },
                select: { point: true }, 
            });
            // console.log('Updated user point:', updatedUser.point);

            if (updatedUser.point % 5 === 0) {
                await this.prismaService.notification.create({
                  data: {
                      userId: post.user.id,
                      actor: post.user.username, 
                      content: `Chúng ta đã đạt ${updatedUser.point} Trending Point 😀`,
                  },
              });
            }
        }
    return reaction;
  }

  async deleteReaction(userId: string, postId: string) {
    const reaction = await this.prismaService.reaction.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    if (!reaction) {
      throw new Error('Không tìm thấy cảm xúc để xóa');
    }
    await this.prismaService.reaction.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
      include: {
        user: true,
      },
    });
    await this.prismaService.user.update({
      where: { id: post?.user?.id },
      data: { point: { decrement: 1 } },
    });
  }

  async getReactionsByPostId(postId: string) {
    return this.prismaService.reaction.findMany({
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
  }

  async getReactionsByUserId(userId: string, postId: string) {
    return this.prismaService.reaction.findUnique({
      where: { 
        userId_postId: {
          userId,
          postId,
        }, },
      select : {
        type: true,
      }
    });
  }
}
