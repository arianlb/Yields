import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { WebSocketsService } from './web-sockets.service';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class WebSocketsGateway {
  constructor(private readonly webSocketsService: WebSocketsService) {}

  @SubscribeMessage('change-person')
  handleChangePerson(client: Socket, payload: any) {
    client.broadcast.emit('change-person', payload);
  }

  @SubscribeMessage('change-policy')
  handleChangePolicy(client: Socket, payload: any) {
    client.broadcast.emit('change-policy', payload);
  }
}
