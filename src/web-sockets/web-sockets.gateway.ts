import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WebSocketsService } from './web-sockets.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class WebSocketsGateway {
  @WebSocketServer() wss: Server;

  constructor(private readonly webSocketsService: WebSocketsService) {}

  @SubscribeMessage('change-person')
  handleChangePerson(client: Socket, payload: any) {
    client.broadcast.emit('change-person', payload);
  }

  @SubscribeMessage('change-policy')
  handleChangePolicy(client: Socket, payload: any) {
    client.broadcast.emit('change-policy', payload);
  }

  emitChangePerson(payload: any) {
    this.wss.emit('change-person', payload);
  }

  emitChangePolicy(payload: any) {
    this.wss.emit('change-policy', payload);
  }
}
