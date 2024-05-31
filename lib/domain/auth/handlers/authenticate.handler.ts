import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  IEvent,
} from '@nestjs/cqrs';
import { GoveeAccountService } from '~ultimate-govee-data';
import { IoTChannelConfigReceivedEvent } from '../../channels/iot/events/iot-channel-config-received.event';
import { RestChannelConfigReceivedEvent } from '../../channels/rest/events/rest-channel-config-received.event';
import { AuthService } from '../auth.service';
import { AccountAuthData, BffAuthData } from '../auth.state';
import { AuthenticateCommand } from '../commands/authenticate.command';
import { Logger } from '@nestjs/common';

@CommandHandler(AuthenticateCommand)
export class AuthenticateCommandHandler
  implements ICommandHandler<AuthenticateCommand>
{
  private readonly logger: Logger = new Logger(AuthenticateCommandHandler.name);
  constructor(
    private readonly goveeApi: GoveeAccountService,
    private readonly authService: AuthService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AuthenticateCommand): Promise<any> {
    const events: IEvent[] = [];
    const authResult = await this.goveeApi.authenticate(command);
    this.logger.error('Authentication Result');
    this.logger.error(authResult);
    if (authResult.oauth !== undefined) {
      const accountAuthData: AccountAuthData = {
        accountId: authResult.accountId,
        clientId: authResult.clientId,
        oauth: authResult.oauth,
      };
      this.authService.setAuthData(accountAuthData);
      events.push(new RestChannelConfigReceivedEvent(authResult));
    }
    if (authResult.bffOAuth !== undefined) {
      const bffAuthData: BffAuthData = {
        accountId: authResult.accountId,
        clientId: authResult.clientId,
        oauth: authResult.bffOAuth,
      };
      this.authService.setCommunityData(bffAuthData);
    }

    if (authResult.iot !== undefined) {
      events.push(new IoTChannelConfigReceivedEvent(authResult.iot));
    }
    this.eventBus.publishAll(events);
  }
}
