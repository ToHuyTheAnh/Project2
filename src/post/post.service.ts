import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/db/prisma.service';
import { CreatePostDto, UpdatePostDto } from './post.dto';
import { Post } from '@prisma/client';
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
      data: dataToSave,
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

  async getPostById(id: string): Promise<Post | null> { 
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
