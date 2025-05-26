import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreatePostDto, UpdatePostDto } from './post.dto';
import { Post, PostStatus, UserSharePost } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const deleteFileIfExists = (filePath: string | null | undefined) => {
  if (!filePath) return;
  const fullPath = path.join(process.cwd(), 'public', filePath);
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted file: ${fullPath}`);
    }
  } catch (err) {
    console.error(`Error deleting file ${fullPath}:`, err);
  }
};

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPost(
    postData: CreatePostDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<Post> {
    console.log('--- PostService ---');
    console.log(
      'CreatePost - Received file:',
      file ? `${file.originalname} (${file.mimetype})` : 'No file',
    );

    if (!postData) {
      throw new HttpException(
        'Received invalid post data',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!userId) {
      throw new HttpException(
        'User ID is required to create a post',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const dataToSave: any = {
      ...postData,
      userId,
      imageUrl: postData.imageUrl || null,
      videoUrl: postData.videoUrl || null,
    };

    if (file) {
      const relativePath = file.path
        .substring(file.path.indexOf(path.join('uploads')))
        .replace(/\\/g, '/');
      const finalUrl = `/${relativePath}`;

      if (file.mimetype.startsWith('image')) {
        dataToSave.imageUrl = finalUrl;
        dataToSave.videoUrl = null;
        console.log(`Saving image URL: ${finalUrl}`);
      } else if (file.mimetype.startsWith('video')) {
        dataToSave.videoUrl = finalUrl;
        dataToSave.imageUrl = null;
        console.log(`Saving video URL: ${finalUrl}`);
      }
    }

    if (dataToSave.imageUrl === undefined) delete dataToSave.imageUrl;
    if (dataToSave.videoUrl === undefined) delete dataToSave.videoUrl;

    if (postData.trendTopicId) {
      const trend = await this.prismaService.trendTopic.findUnique({
        where: { id: postData.trendTopicId },
      });
      if (!trend) {
        throw new HttpException('Trendtopic not exist', HttpStatus.BAD_REQUEST);
      }
      dataToSave.trendTopicId = postData.trendTopicId;
    }

    console.log('Data being saved to DB:', dataToSave);

    return this.prismaService.post.create({
      data: dataToSave,
    });
  }

  async updatePost(
    id: string,
    postData: UpdatePostDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<Post> {
    const post = await this.prismaService.post.findUnique({ where: { id } });
    if (!post) {
      throw new HttpException('Bài đăng không tồn tại', HttpStatus.NOT_FOUND);
    }

    // --- Kiểm tra quyền ---
    // if (post.userId !== userId /* && !userIsAdmin */) {
    //    throw new HttpException('Bạn không có quyền chỉnh sửa bài đăng này', HttpStatus.FORBIDDEN);
    // }

    const dataToUpdate: any = { ...postData };
    const oldImageUrl = post.imageUrl;
    const oldVideoUrl = post.videoUrl;

    if (file) {
      const relativePath = file.path
        .substring(file.path.indexOf(path.join('uploads')))
        .replace(/\\/g, '/');
      const finalUrl = `/${relativePath}`;

      if (file.mimetype.startsWith('image')) {
        dataToUpdate.imageUrl = finalUrl;
        dataToUpdate.videoUrl = null;
        deleteFileIfExists(oldVideoUrl);
        deleteFileIfExists(oldImageUrl);
        console.log(`Updating with new image: ${finalUrl}`);
      } else if (file.mimetype.startsWith('video')) {
        dataToUpdate.videoUrl = finalUrl;
        dataToUpdate.imageUrl = null;
        deleteFileIfExists(oldImageUrl);
        deleteFileIfExists(oldVideoUrl);
        console.log(`Updating with new video: ${finalUrl}`);
      }
    } else {
      if (postData.imageUrl !== undefined) {
        dataToUpdate.imageUrl = postData.imageUrl;
        if (dataToUpdate.imageUrl === null || dataToUpdate.imageUrl === '') {
          deleteFileIfExists(oldImageUrl);
          if (oldVideoUrl) dataToUpdate.videoUrl = oldVideoUrl;
        } else {
          if (oldVideoUrl) {
            dataToUpdate.videoUrl = null;
            deleteFileIfExists(oldVideoUrl);
          }
        }
      }
      if (postData.videoUrl !== undefined) {
        dataToUpdate.videoUrl = postData.videoUrl;
        if (dataToUpdate.videoUrl === null || dataToUpdate.videoUrl === '') {
          deleteFileIfExists(oldVideoUrl);
          if (oldImageUrl) dataToUpdate.imageUrl = oldImageUrl;
        } else {
          if (oldImageUrl) {
            dataToUpdate.imageUrl = null;
            deleteFileIfExists(oldImageUrl);
          }
        }
      }
    }

    if (
      dataToUpdate.imageUrl === undefined &&
      !file?.mimetype.startsWith('image')
    )
      delete dataToUpdate.imageUrl;
    if (
      dataToUpdate.videoUrl === undefined &&
      !file?.mimetype.startsWith('video')
    )
      delete dataToUpdate.videoUrl;

    console.log('Data being updated in DB:', dataToUpdate);

    return this.prismaService.post.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async getPosts(): Promise<Post[]> {
    return this.prismaService.post.findMany({
      where: { status: PostStatus.Published },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, displayName: true, avatar: true } },
        trendTopic: { select: { id: true, title: true } },
      },
    });
  }

  async getPostById(id: string): Promise<Post | null> {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, displayName: true, avatar: true } },
        trendTopic: { select: { id: true, title: true } },
      },
    });
    // Cho phép xem bài bị ban/deleted nếu có link trực tiếp? Hoặc chỉ admin? Tùy logic
    // if (!post || (post.status !== PostStatus.Published && post.status !== PostStatus.Banned /* && !userIsAdmin */)) {
    if (!post || post.status === PostStatus.Deleted) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Bài đăng không tồn tại hoặc đã bị xóa`,
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
      throw new HttpException(`User không tồn tại`, HttpStatus.NOT_FOUND);
    }
    return this.prismaService.post.findMany({
      where: { userId, status: PostStatus.Published }, // Chỉ lấy bài published
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, displayName: true, avatar: true } },
      },
    });
  }

  async deletePostById(
    id: string,
    // userId: string /*, userIsAdmin: boolean */,
  ): Promise<void> {
    const post = await this.prismaService.post.findUnique({
      where: { id },
    });
    if (!post) {
      throw new HttpException(`Bài đăng không tồn tại`, HttpStatus.NOT_FOUND);
    }

    // --- Kiểm tra quyền ---
    // if (post.userId !== userId /* && !userIsAdmin */) {
    //    throw new HttpException('Bạn không có quyền xóa bài đăng này', HttpStatus.FORBIDDEN);
    // }

    // --- Xóa file ảnh và video liên quan ---
    deleteFileIfExists(post.imageUrl);
    deleteFileIfExists(post.videoUrl);

    // --- Xóa bài đăng khỏi DB ---
    // Lưu ý: Do có `onDelete: Cascade` ở Comment và Reaction, các bản ghi liên quan cũng sẽ bị xóa.
    // UserSharePost cũng nên có onDelete: Cascade để xóa khi post bị xóa.
    await this.prismaService.post.delete({
      where: { id },
    });

    // --- Hoặc: Cập nhật status thành Deleted ---
    // await this.prismaService.post.update({
    //   where: { id },
    //   data: { status: PostStatus.Deleted },
    // });
  }

  async searchPostByKeyword(keyword: string): Promise<Post[]> {
    const posts = await this.prismaService.post.findMany({
      where: {
        status: PostStatus.Published,
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, displayName: true, avatar: true } },
      },
    });
    return posts;
  }

  async userSharePost(
    postId: string,
    userId: string,
  ): Promise<{ message: string; data: UserSharePost }> {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId, status: PostStatus.Published },
    });

    if (!post) {
      throw new HttpException(
        'Bài đăng không tồn tại hoặc chưa được duyệt',
        HttpStatus.NOT_FOUND,
      );
    }

    const alreadyShared = await this.prismaService.userSharePost.findFirst({
      where: { postId, userId },
    });

    if (alreadyShared) {
      throw new HttpException(
        'Bạn đã chia sẻ bài viết này rồi.',
        HttpStatus.CONFLICT,
      );
    }

    const sharedPost = await this.prismaService.userSharePost.create({
      data: { postId, userId },
    });
    // await this.prismaService.notification.create({

    // })
    return {
      message: 'Chia sẻ bài viết thành công',
      data: sharedPost,
    };
  }

  async userDeleteSharePost(postId: string, userId: string): Promise<void> {
    const sharedEntry = await this.prismaService.userSharePost.findFirst({
      where: { postId, userId },
    });

    if (!sharedEntry) {
      throw new HttpException(
        'Bạn chưa chia sẻ bài viết này.',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prismaService.userSharePost.delete({
      where: { id: sharedEntry.id },
    });
  }

  async getPostShareByUserId(userId: string): Promise<Post[]> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException(`User không tồn tại`, HttpStatus.NOT_FOUND);
    }
    const userSharePosts = await this.prismaService.userSharePost.findMany({
      where: { userId },
      include: {
        post: {
          // Include bài post gốc
          include: {
            user: { select: { id: true, displayName: true, avatar: true } },
          }, // Include cả user của post gốc
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return userSharePosts
      .map((sharedPost) => {
        if (
          !sharedPost.post ||
          sharedPost.post.status !== PostStatus.Published
        ) {
          return {
            id: sharedPost.postId,
            title: 'Bài viết không còn khả dụng',
            content: '',
            userId: 'unknown',
            trendTopicId: 'unknown',
            status: PostStatus.Deleted,
            imageUrl: null,
            videoUrl: null,
            createdAt: sharedPost.createdAt,
            updatedAt: sharedPost.updatedAt,
            comments: [],
            reactions: [],
            sharedById: [],
            user: {
              id: 'unknown',
              displayName: 'Người dùng không xác định',
              avatar: null,
            },
          } as unknown as Post;
        }
        return sharedPost.post;
      })
      .filter((post) => post !== null);
  }

  async banPost(postId: string): Promise<Post> {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new HttpException(`Bài đăng không tồn tại`, HttpStatus.NOT_FOUND);
    }

    if (post.status === PostStatus.Banned) {
      throw new HttpException(
        `Bài đăng này đã bị ban trước đó.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prismaService.post.update({
      where: { id: postId },
      data: { status: PostStatus.Banned },
    });
  }

  async getPostsByTrendTopic(trendTopicId: string): Promise<Post[]> {
    const posts = await this.prismaService.post.findMany({
      where: {
        trendTopicId,
        status: PostStatus.Published,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, displayName: true, avatar: true } },
      },
    });
    return posts;
  }
}
