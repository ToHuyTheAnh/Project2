import { Inject } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from 'src/message/message.dto';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({
  cors: {
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() io: Server;

  constructor(
    @Inject(MessageService) private readonly messageService: MessageService,
  ) {}

  afterInit() {}
  handleConnection() {}
  handleDisconnect() {}
  @SubscribeMessage('join')
  async handleJoinRoom(client: Socket, { chatBoxId }: { chatBoxId: string }) {
    await client.join(chatBoxId);
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    {
      chatBoxId,
      userId,
      message,
    }: { chatBoxId: string; userId: string; message: string },
  ) {
    try {
      const createMessageDto: CreateMessageDto = {
        chatBoxId,
        content: message,
        status: 'Published',
      };

      const newMessage = await this.messageService.createMessage(
        createMessageDto,
        userId,
      );
      this.io.to(chatBoxId).emit('message', {
        userId: newMessage.userId,
        chatBoxId: newMessage.chatBoxId,
        content: newMessage.content,
        status: newMessage.status,
        createdAt: newMessage.createdAt,
      });
    } catch (error) {
      console.error('Error creating message:', error);
      client.emit('error', 'Đã xảy ra lỗi khi gửi tin nhắn');
    }
  }
}
