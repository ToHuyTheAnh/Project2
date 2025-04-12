import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './db/prisma.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module'; // Import PostModule
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [PrismaModule, UserModule, PostModule, CommentModule], // Add PostModule to imports
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
