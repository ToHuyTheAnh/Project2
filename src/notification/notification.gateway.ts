import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() io: Server;

  private onlineUsers = new Map<string, string>();

  afterInit() {}
  handleConnection() {}
  handleDisconnect(socket: Socket) {
    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === socket.id) {
        this.onlineUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(socket: Socket, userId: string) {
    this.onlineUsers.set(userId, socket.id);
  }

  sendNotificationToUser(userId: string, notificationData: any) {
    const socketId = this.onlineUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notificationData);
    }
  }
}
