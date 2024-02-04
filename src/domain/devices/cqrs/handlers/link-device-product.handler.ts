import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { ModelProductQuery } from '@govee/domain/channels/rest/queries';
import { LinkDeviceProductCommand } from '../commands';
import { DeviceConfigReceivedEvent } from '../events';

@CommandHandler(LinkDeviceProductCommand)
export class LinkDeviceProductCommandHandler
  implements ICommandHandler<LinkDeviceProductCommand>
{
  constructor(
    readonly queryBus: QueryBus,
    readonly eventBus: EventBus,
  ) {}

  async execute(command: LinkDeviceProductCommand): Promise<any> {
    const product = await this.queryBus.execute(
      new ModelProductQuery(command.device),
    );
    this.eventBus.publish(
      new DeviceConfigReceivedEvent(command.device, product),
    );
  }
}
