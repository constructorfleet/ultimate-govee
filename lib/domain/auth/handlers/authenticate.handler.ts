import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  IEvent,
} from '@nestjs/cqrs';
import { GoveeAccountService } from '~ultimate-govee-data';
import { AuthenticateCommand } from '../commands/authenticate.command';
import { AuthService } from '../auth.service';
import { RestChannelConfigReceivedEvent } from '../../channels/rest/events/rest-channel-config-received.event';
import { IoTChannelConfigReceivedEvent } from '../../channels/iot/events/iot-channel-config-received.event';

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
    const authResult = await this.goveeApi.authenticate(command);
    this.authService.setAuthData(authResult);
    const events: IEvent[] = [new RestChannelConfigReceivedEvent(authResult)];
    if (authResult.iot !== undefined) {
      events.push(new IoTChannelConfigReceivedEvent(authResult.iot));
    }
    this.eventBus.publishAll(events);
  }
}
