import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './db/prisma.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module'; // Import PostModule
import { CommentModule } from './comment/comment.module';
import { ChatboxModule } from './chatBox/chatBox.module';
import { TrendTopicModule } from './trendTopic/trendTopic.module';
import { ChatGatewayModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './notification/notification.module';
import { ReactionModule } from './reaction/reaction.module';
import { ShopModule } from './pointShop/shop.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    PostModule,
    CommentModule,
    ChatboxModule,
    TrendTopicModule,
    ChatGatewayModule,
    AuthModule,
    NotificationModule,
    ReactionModule,
    ShopModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
