import { Module } from '@nestjs/common';
import { ChatBoxService } from './chatBox.service';
import { ChatBoxController } from './chatBox.controller';
import { PrismaModule } from 'src/db/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ChatBoxService],
  controllers: [ChatBoxController],
})
export class ChatboxModule {}
