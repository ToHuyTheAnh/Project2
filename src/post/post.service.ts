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
    // --- DEBUGGING STEP ---
    console.log('--- PostService ---');
    console.log('Entered createPost with postData:', postData); // <-- Add this log
    console.log('Entered createPost with file:', file ? file.originalname : 'No file');
    // --- END DEBUGGING STEP ---

    // Explicit check right at the start
    if (!postData) {
        console.error("postData is undefined or null at the start of PostService.createPost!");
        // It's better to throw an error than proceed
        throw new HttpException('Received invalid post data', HttpStatus.BAD_REQUEST);
    }


    const dataToSave: any = { ...postData }; // Potential error if postData is not an object


    if (file) {
      dataToSave.imageUrl = `/uploads/post-images/${file.filename}`;
    } else if (postData.imageUrl) { // Line 19 (approx) - Error occurs here
       dataToSave.imageUrl = postData.imageUrl;
    } else {
      dataToSave.imageUrl = null;
    }


    return this.prismaService.post.create({
      data: dataToSave,
    });
  }

  async updatePost(id: string, postData: UpdatePostDto, file?: Express.Multer.File): Promise<Post> {
     const post = await this.prismaService.post.findUnique({ where: { id } }); // Get existing post to check old image
     if (!post) {
        // getPostById already throws error, but double-check if needed
        throw new HttpException('Bài đăng không tồn tại', HttpStatus.NOT_FOUND);
     }

     const dataToUpdate: any = { ...postData };
     const oldImageUrl = post?.imageUrl; // Store the old image URL

     if (file) {
       // If a new file is uploaded, update the imageUrl
       dataToUpdate.imageUrl = `/uploads/post-images/${file.filename}`;

       // (Optional but recommended) Delete the old image file if it exists
       if (oldImageUrl) {
         const oldImagePath = path.join(process.cwd(), oldImageUrl); // Construct absolute path
         try {
           if (fs.existsSync(oldImagePath)) { // Check if file exists before deleting
              fs.unlinkSync(oldImagePath); // Synchronous delete
              console.log(`Deleted old image: ${oldImageUrl}`);
           }
         } catch (err) {
           console.error(`Error deleting old image ${oldImageUrl}:`, err);
           // Decide if you want to throw an error or just log it
         }
       }
     } else if (postData.imageUrl !== undefined) {
        // If imageUrl is explicitly provided in DTO (and not null/undefined), update it
        // This allows clearing the image by sending imageUrl: null
        dataToUpdate.imageUrl = postData.imageUrl;
     } else {
       // If no new file and imageUrl is not in DTO, keep the existing one
       // This prevents accidentally removing the image if imageUrl isn't sent
       dataToUpdate.imageUrl = oldImageUrl;
     }


     // Ensure fields not meant for Prisma update are removed if necessary
     // delete dataToUpdate.someFieldNotInModel;


    return this.prismaService.post.update({
      where: { id },
      data: dataToUpdate, // Use the modified dataToUpdate object
    });
  }

  async getPosts(): Promise<Post[]> {
    return this.prismaService.post.findMany();
  }

  async getPostById(id: string): Promise<Post | null> { // Return type can be Post | null
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
