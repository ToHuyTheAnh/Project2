import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/db/prisma.service';
import { CreatePostDto, UpdatePostDto } from './post.dto';
import { Post } from '@prisma/client';
import { UserSharePost } from '@prisma/client';
import * as fs from 'fs'; // Import fs module for file system operations
import * as path from 'path';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPost(postData: CreatePostDto, file?: Express.Multer.File): Promise<Post> {
    console.log('--- PostService ---');
    console.log('Entered createPost with postData:', postData); // <-- Add this log
    console.log('Entered createPost with file:', file ? file.originalname : 'No file');

    if (!postData) {
        console.error("postData is undefined or null at the start of PostService.createPost!");
        throw new HttpException('Received invalid post data', HttpStatus.BAD_REQUEST);
    }


    const dataToSave: any = { ...postData }; 


    if (file) {
      dataToSave.imageUrl = `/uploads/post-images/${file.filename}`;
    } else if (postData.imageUrl) { 
       dataToSave.imageUrl = postData.imageUrl;
    } else {
      dataToSave.imageUrl = null;
    }

    return this.prismaService.post.create({
      data: {
        ...dataToSave,
        userId,
      },
    });
  }

  async updatePost(id: string, postData: UpdatePostDto, file?: Express.Multer.File): Promise<Post> {
     const post = await this.prismaService.post.findUnique({ where: { id } }); 
     if (!post) {
        throw new HttpException('Bài đăng không tồn tại', HttpStatus.NOT_FOUND);
     }

     const dataToUpdate: any = { ...postData };
     const oldImageUrl = post?.imageUrl;

     if (file) {
       dataToUpdate.imageUrl = `/uploads/post-images/${file.filename}`;

       if (oldImageUrl) {
         const oldImagePath = path.join(process.cwd(), oldImageUrl); 
         try {
           if (fs.existsSync(oldImagePath)) { 
              fs.unlinkSync(oldImagePath);
              console.log(`Deleted old image: ${oldImageUrl}`);
           }
         } catch (err) {
           console.error(`Error deleting old image ${oldImageUrl}:`, err);
         }
       }
     } else if (postData.imageUrl !== undefined) {
        dataToUpdate.imageUrl = postData.imageUrl;
     } else {
       dataToUpdate.imageUrl = oldImageUrl;
     }

    return this.prismaService.post.update({
      where: { id },
      data: dataToUpdate, 
    });
  }

  async getPosts(): Promise<Post[]> {
    return this.prismaService.post.findMany();
  }

<<<<<<< HEAD
  async getPostById(id: string): Promise<Post | null> { 
=======
  async getPostById(id: string): Promise<Post | null> {
    // Return type can be Post | null
>>>>>>> 61805c21e454f64ca41d37d964762e3fe0dc23ca
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

  async UserSharePost(
    postId: string,
    userId: string,
  ): Promise<{ message: string; data: UserSharePost }> {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Bài đăng không tồn tại',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const alreadyShared = await this.prismaService.userSharePost.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (alreadyShared) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'Bạn đã chia sẻ bài viết này rồi.',
        },
        HttpStatus.CONFLICT,
      );
    }

    const sharedPost = await this.prismaService.userSharePost.create({
      data: {
        postId,
        userId,
      },
    });

    return {
      message: 'Chia sẻ bài viết thành công',
      data: sharedPost,
    };
  }

  // Khi người dùng hủy chia sẻ bài viết, xóa bản ghi trong bảng userSharePost
  async UserDeleteSharePost(postId: string, userId: string) {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Bài đăng không tồn tại',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const alreadyShared = await this.prismaService.userSharePost.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (!alreadyShared) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'Bài viết này chưa được chia sẻ.',
        },
        HttpStatus.CONFLICT,
      );
    }

    await this.prismaService.userSharePost.delete({
      where: { id: alreadyShared.id },
    });
  }

  // Lấy danh sách bài viết mà người dùng đã chia sẻ, nếu bài viết đã bị xóa thì trả về bài viết nội dung đặc biệt
  async getPostShareByUserId(userId: string): Promise<Post[]> {
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
    const userSharePost = await this.prismaService.userSharePost.findMany({
      where: { userId },
    });

    const posts: Post[] = [];

    for (const postShared of userSharePost) {
      const post = await this.prismaService.post.findUnique({
        where: { id: postShared.postId },
      });
      if (!post) {
        posts.push({
          id: postShared.postId,
          title: 'Bài viết đã bị xóa',
          content: 'Nội dung không khả dụng',
          userId: '',
          createdAt: postShared.createdAt,
          updatedAt: postShared.updatedAt,
          imageUrl: null,
        } as Post);
      } else {
        posts.push(post);
      }
    }

    return posts;
  }
}
