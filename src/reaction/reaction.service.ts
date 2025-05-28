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
}
