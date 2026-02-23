import { Module } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { QqcatalystService } from './qqcatalyst.service';
import { QqcatalystController } from './qqcatalyst.controller';
import { OfficesModule } from '../offices/offices.module';
import { UsersModule } from '../users/users.module';
import { PersonsModule } from '../persons/persons.module';
import { PoliciesModule } from '../policies/policies.module';
import { WebSocketsModule } from '../web-sockets/web-sockets.module';
import { OfficesService } from '../offices/offices.service';
import { UsersService } from '../users/users.service';
import { PersonsService } from '../persons/persons.service';
import { PoliciesService } from '../policies/policies.service';
import { WebSocketsGateway } from '../web-sockets/web-sockets.gateway';

@Module({
  controllers: [QqcatalystController],
  imports: [
    HttpModule,
    AuthModule,
    OfficesModule,
    UsersModule,
    PersonsModule,
    PoliciesModule,
    WebSocketsModule,
  ],
  providers: [
    {
      provide: 'SEBANDA_89',
      useFactory: (
        httpService: HttpService,
        officesService: OfficesService,
        usersService: UsersService,
        personsService: PersonsService,
        policiesService: PoliciesService,
        webSocketGateway: WebSocketsGateway,
      ) => {
        return new QqcatalystService(
          httpService,
          officesService,
          usersService,
          personsService,
          policiesService,
          webSocketGateway,
          process.env.QQCATALYST_CLIENT_ID_A,
          process.env.QQCATALYST_CLIENT_SECRET_A,
          process.env.QQCATALYST_USER_A,
          process.env.QQCATALYST_PASSWORD,
          '89',
        );
      },
      inject: [HttpService, OfficesService, UsersService, PersonsService, PoliciesService, WebSocketsGateway],
    },
    {
      provide: 'SEBANDA_117',
      useFactory: (
        httpService: HttpService,
        officesService: OfficesService,
        usersService: UsersService,
        personsService: PersonsService,
        policiesService: PoliciesService,
        webSocketGateway: WebSocketsGateway,
      ) => {
        return new QqcatalystService(
          httpService,
          officesService,
          usersService,
          personsService,
          policiesService,
          webSocketGateway,
          process.env.QQCATALYST_CLIENT_ID_B,
          process.env.QQCATALYST_CLIENT_SECRET_B,
          process.env.QQCATALYST_USER_B,
          process.env.QQCATALYST_PASSWORD,
          '117',
        );
      },
      inject: [HttpService, OfficesService, UsersService, PersonsService, PoliciesService, WebSocketsGateway],
    },
  ],
})
export class QqcatalystModule {}
