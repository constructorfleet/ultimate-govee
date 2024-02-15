import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { GoveeAccountService } from '@govee/data';
import { AuthenticateCommand } from '../commands/authenticate.command';
import { AuthService } from '../auth.service';
import { RestChannelConfigReceivedEvent } from '../../channels/rest/events/rest-channel-config-received.event';
import { IoTChannelConfigReceivedEvent } from '../../channels/iot/events/iot-channel-config-received.event';
import {
  concatMap,
  filter,
  from,
  map,
  mergeAll,
  mergeMap,
  of,
  switchMap,
  tap,
} from 'rxjs';

@CommandHandler(AuthenticateCommand)
export class AuthenticateCommandHandler
  implements ICommandHandler<AuthenticateCommand>
{
  constructor(
    private readonly goveeApi: GoveeAccountService,
    private readonly authService: AuthService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AuthenticateCommand): Promise<any> {
    from(this.goveeApi.authenticate(command))
      .pipe(
        filter((authResult) => authResult !== undefined),
        map((authResult) => authResult!),
        tap(({ iot }) =>
          of(iot)
            .pipe(
              filter((iot) => iot !== undefined),
              map((iot) => iot!),
              map((iot) => new IoTChannelConfigReceivedEvent(iot)),
            )
            .subscribe((event) => this.eventBus.publish(event)),
        ),
        map((authResult) => new RestChannelConfigReceivedEvent(authResult)),
      )
      .subscribe((event) => this.eventBus.publish(event));
  }
}
