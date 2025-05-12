import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreatePostDto, UpdatePostDto } from './post.dto';
import { Post, PostStatus, UserSharePost } from '@prisma/client'; // <<< Thêm PostStatus
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPost(postData: CreatePostDto, userId: string, file?: Express.Multer.File): Promise<Post> {
    console.log('--- PostService ---');
    console.log('Entered createPost with postData:', postData);
    console.log('Entered createPost with file:', file ? file.originalname : 'No file');
    console.log('User ID creating post:', userId);


    if (!postData) {
        console.error("postData is undefined or null at the start of PostService.createPost!");
        throw new HttpException('Received invalid post data', HttpStatus.BAD_REQUEST);
    }
    if (!userId) {
        console.error("userId is undefined or null in PostService.createPost!");
        throw new HttpException('User ID is required to create a post', HttpStatus.UNAUTHORIZED); // Hoặc BAD_REQUEST
    }


    const dataToSave: any = { ...postData, userId }; // Gán userId vào đây


    if (file) {
      dataToSave.imageUrl = `/uploads/post-images/${file.filename}`; // Đường dẫn tương đối từ thư mục public
    } else if (postData.imageUrl) {
       dataToSave.imageUrl = postData.imageUrl; 
    } else {
      dataToSave.imageUrl = null; 
    }
    
    if (!dataToSave.trendTopicId) {
        // Gán một trendTopicId mặc định hoặc throw error nếu nó là bắt buộc
        // Ví dụ: dataToSave.trendTopicId = 'default-topic-id';
        // Hoặc: throw new HttpException('Trend Topic ID is required', HttpStatus.BAD_REQUEST);
        // Hiện tại, schema của bạn có vẻ yêu cầu trendTopicId
    }


    return this.prismaService.post.create({
      data: dataToSave,
    });
  }

  async updatePost(id: string, postData: UpdatePostDto, userId: string, file?: Express.Multer.File): Promise<Post> {
     const post = await this.prismaService.post.findUnique({ where: { id } });
     if (!post) {
        throw new HttpException('Bài đăng không tồn tại', HttpStatus.NOT_FOUND);
     }

     // Kiểm tra quyền: chỉ chủ bài đăng hoặc admin mới được sửa
     // if (post.userId !== userId && !userIsAdmin) { // userIsAdmin là biến boolean kiểm tra quyền admin
     //    throw new HttpException('Bạn không có quyền chỉnh sửa bài đăng này', HttpStatus.FORBIDDEN);
     // }


     const dataToUpdate: any = { ...postData };
     const oldImageUrl = post?.imageUrl;

     if (file) {
       dataToUpdate.imageUrl = `/uploads/post-images/${file.filename}`;
       if (oldImageUrl) {
         const oldImagePath = path.join(process.cwd(), 'public', oldImageUrl); // Giả sử ảnh nằm trong public
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
        if ((postData.imageUrl === null || postData.imageUrl === "") && oldImageUrl) {
            const oldImagePath = path.join(process.cwd(), 'public', oldImageUrl);
             try {
               if (fs.existsSync(oldImagePath)) {
                  fs.unlinkSync(oldImagePath);
                  console.log(`Deleted old image due to update: ${oldImageUrl}`);
               }
             } catch (err) {
               console.error(`Error deleting old image ${oldImageUrl}:`, err);
             }
        }
     }


    return this.prismaService.post.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async getPosts(): Promise<Post[]> {
    return this.prismaService.post.findMany({
        where: { status: PostStatus.Published }, 
        orderBy: { createdAt: 'desc'}
    });
  }

  async getPostById(id: string): Promise<Post | null> {
    const post = await this.prismaService.post.findUnique({
      where: { id },
    });
    if (!post || post.status !== PostStatus.Published) { 
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Bài đăng không tồn tại hoặc chưa được duyệt`,
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
    return this.prismaService.post.findMany({
      where: { userId, status: PostStatus.Published }, // Chỉ lấy bài đã publish của user
      orderBy: { createdAt: 'desc'}
    });
  }

  async deletePostById(id: string, userId: string /*, userIsAdmin: boolean */): Promise<void> {
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

    // Kiểm tra quyền: chủ bài đăng hoặc admin mới được xóa
    // if (post.userId !== userId && !userIsAdmin) {
    //    throw new HttpException('Bạn không có quyền xóa bài đăng này', HttpStatus.FORBIDDEN);
    // }

    // Thay vì xóa hẳn, có thể đổi status thành Deleted
    // await this.prismaService.post.update({
    //   where: { id },
    //   data: { status: PostStatus.Deleted },
    // });

    if (post.imageUrl) {
        const imagePath = path.join(process.cwd(), 'public', post.imageUrl);
        try {
            if(fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log(`Deleted image of post ${id}: ${post.imageUrl}`);
            }
        } catch (err) {
            console.error(`Error deleting image for post ${id}:`, err);
        }
    }
    await this.prismaService.post.delete({
      where: { id },
    });
  }

  async searchPostByKeyword(keyword: string): Promise<Post[]> {
    const posts = await this.prismaService.post.findMany({
      where: {
        status: PostStatus.Published, // Chỉ tìm trong các bài đã published
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      },
      orderBy: { createdAt: 'desc'}
    });

    // Không nên throw lỗi nếu không tìm thấy, trả về mảng rỗng là đủ
    // if (posts.length === 0) {
    //   throw new HttpException(
    //     {
    //       statusCode: HttpStatus.NOT_FOUND,
    //       message: 'Không tìm thấy bài viết nào phù hợp',
    //     },
    //     HttpStatus.NOT_FOUND,
    //   );
    // }
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
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Bài đăng không tồn tại hoặc chưa được duyệt',
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

  async userDeleteSharePost(postId: string, userId: string): Promise<void> {
    const sharedEntry = await this.prismaService.userSharePost.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (!sharedEntry) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND, 
          message: 'Bạn chưa chia sẻ bài viết này.',
        },
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
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User không tồn tại`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const userSharePosts = await this.prismaService.userSharePost.findMany({
      where: { userId },
      include: { post: true }, 
      orderBy: { createdAt: 'desc'}
    });

    const posts: Post[] = userSharePosts.map(sharedPost => {
      if (!sharedPost.post || sharedPost.post.status !== PostStatus.Published) {

        return {
          id: sharedPost.postId,
          title: 'Bài viết không còn khả dụng',
          content: 'Nội dung đã bị ẩn hoặc xóa.',
          userId: sharedPost.post?.userId || 'unknown', 
          trendTopicId: sharedPost.post?.trendTopicId || 'unknown',
          status: PostStatus.Deleted, 
          imageUrl: null,
          videoUrl: null,
          createdAt: sharedPost.post?.createdAt || sharedPost.createdAt, 
          updatedAt: sharedPost.post?.updatedAt || sharedPost.createdAt,
          comments: [],
          reactions: [],
          sharedById: []
        } as unknown as Post;
      }
      return sharedPost.post;
    });
    return posts;
  }

  // --- Thêm phương thức banPost ---
  /**
   * Ban một bài đăng.
   * @param postId ID của bài đăng cần ban.
   * @returns Thông tin bài đăng đã được cập nhật.
   */
  async banPost(postId: string): Promise<Post> {
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

    if (post.status === PostStatus.Banned) {
         throw new HttpException(
        {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Bài đăng này đã bị ban trước đó.`,
        },
        HttpStatus.BAD_REQUEST,
        );
    }

    return this.prismaService.post.update({
      where: { id: postId },
      data: { status: PostStatus.Banned },
    });
  }
}