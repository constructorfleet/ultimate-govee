import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { GoveeAccountService } from '@govee/data';
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
    const result = await this.goveeApi.authenticate(command);
    if (!result) {
      return false;
    }
    this.authService.setAuthData(result);
    if (result.iot !== undefined) {
      this.eventBus.publish(new IoTChannelConfigReceivedEvent(result.iot));
    }
    this.eventBus.publish(new RestChannelConfigReceivedEvent(result));
    return true;
  }
}
