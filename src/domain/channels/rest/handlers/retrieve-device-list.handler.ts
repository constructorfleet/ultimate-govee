import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { GoveeDeviceService } from '@govee/data';
import { Logger } from '@nestjs/common';
import { CQRS } from '@govee/domain/devices';
import { AccountAuthData, AuthDataQuery } from '../../../auth';
import { RetrieveDeviceListCommand } from '../commands';

@CommandHandler(RetrieveDeviceListCommand)
export class RetrieveDeviceListCommandHandler
  implements ICommandHandler<RetrieveDeviceListCommand>
{
  private readonly logger: Logger = new Logger(
    RetrieveDeviceListCommandHandler.name,
  );

  constructor(
    private readonly api: GoveeDeviceService,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
  ) {}

  async execute(_: RetrieveDeviceListCommand): Promise<any> {
    const authData = await this.queryBus.execute<
      AuthDataQuery,
      AccountAuthData | undefined
    >(new AuthDataQuery());
    if (authData?.oauth !== undefined) {
      this.logger.log(`Getting device list`);
      const deviceList = await this.api.getDeviceList(authData.oauth);
      this.logger.log(`Got ${deviceList.length} devices`);
      deviceList
        .map((device) => new CQRS.DeviceConfigReceivedEvent(device))
        .forEach((event) => this.eventBus.publish(event));
    }
  }
}
