// src/post/post.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreatePostDto, UpdatePostDto } from './post.dto';
import { Post } from '@prisma/client';
import { Express } from 'express';
// import fs from 'fs/promises'; // Import nếu cần xóa file cũ
// import path from 'path';     // Import nếu cần xóa file cũ

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPost(postData: CreatePostDto, file?: Express.Multer.File): Promise<Post> {
    let imageUrl: string | null = null;
    if (file) {
      imageUrl = `/uploads/post-images/${file.filename}`; // Đường dẫn tương đối để lưu vào DB
    }

    // Chuẩn bị dữ liệu để lưu
    const dataToSave = {
      userId: postData.userId,
      title: postData.title,
      content: postData.content,
      status: postData.status,
      likes: postData.likes , // Lấy giá trị like từ DTO hoặc mặc định là 0
      imageUrl: imageUrl,        // Thêm imageUrl (có thể là null)
      // videoUrl: null, // Nếu có xử lý video thì thêm ở đây
    };

    return this.prismaService.post.create({
      data: dataToSave,
    });
  }

  async updatePost(id: string, postData: UpdatePostDto, file?: Express.Multer.File): Promise<Post> {
    // Lấy bài post hiện tại để kiểm tra ảnh cũ (nếu cần xóa)
    const existingPost = await this.getPostById(id); // Dùng lại hàm getPostById để kiểm tra tồn tại và lấy dữ liệu

    let imageUrl: string | null = existingPost.imageUrl; // Giữ ảnh cũ nếu không có file mới

    if (file) {
      // Nếu có file mới được upload
      imageUrl = `/uploads/post-images/${file.filename}`;

      // (Tùy chọn) Xóa file ảnh cũ nếu tồn tại
      // if (existingPost.imageUrl) {
      //   try {
      //      const oldImagePath = path.join(__dirname, '../../..', existingPost.imageUrl); // Cần điều chỉnh đường dẫn tuyệt đối
      //      await fs.unlink(oldImagePath);
      //      console.log('Deleted old image:', oldImagePath);
      //   } catch (error) {
      //      console.error('Error deleting old image:', error);
      //      // Có thể bỏ qua lỗi hoặc xử lý tùy ý
      //   }
      // }
    }

    // Chuẩn bị dữ liệu để cập nhật
    const dataToUpdate = {
      ...postData, // Lấy các trường có thể thay đổi từ DTO
      ...(postData.likes !== undefined && { likes: postData.likes }), // Cập nhật likes nếu có trong DTO
      imageUrl: imageUrl, // Cập nhật imageUrl (là ảnh mới hoặc ảnh cũ hoặc null)
    };
    // Xóa trường 'like' không cần thiết nếu có trong dataToUpdate
    delete dataToUpdate.likes;

    return this.prismaService.post.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  // ... các phương thức getPosts, getPostById, getPostsByUserId, deletePostById giữ nguyên ...
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

     // (Tùy chọn) Xóa file ảnh/video liên quan trước khi xóa bản ghi DB
     // if (post.imageUrl) { /* Logic xóa file ảnh */ }
     // if (post.videoUrl) { /* Logic xóa file video */ }

    await this.prismaService.post.delete({
      where: { id },
    });
  }
}