// src/post/post.module.ts
import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from 'src/db/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: diskStorage({ // Cấu hình lưu trữ vào disk
        destination: './uploads/post-images', // Thư mục lưu file
        filename: (req, file, cb) => {
          // Tạo tên file duy nhất
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`); 
        },
      }),
      // Có thể thêm các tùy chọn khác như giới hạn kích thước file (limits)
      // fileFilter: ... // Để lọc loại file
    }),
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}