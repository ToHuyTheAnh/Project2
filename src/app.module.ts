import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './db/prisma.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { ChatboxModule } from './chatBox/chatBox.module';

@Module({
  imports: [PrismaModule, UserModule, PostModule, CommentModule, ChatboxModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
