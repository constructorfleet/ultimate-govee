import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { GoveeDeviceService } from '~ultimate-govee-data';
import { Logger } from '@nestjs/common';
import { AuthDataQuery } from '../../../auth';
import { RetrieveDeviceListCommand } from '../commands';
import { DeviceConfigReceivedEvent } from '../../../devices/cqrs/events/device-config-received.event';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(_: RetrieveDeviceListCommand): Promise<any> {
    const authData = await this.queryBus.execute(new AuthDataQuery());
    if (authData?.oauth !== undefined) {
      this.logger.log('Getting device list');
      const deviceList = await this.api.getDeviceList(authData.oauth);
      this.logger.log(`Got ${deviceList.length} devices`);
      deviceList
        .map((device) => new DeviceConfigReceivedEvent(device))
        .forEach((event) => this.eventBus.publish(event));
    }
  }
}
