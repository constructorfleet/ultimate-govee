import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { ModelProductQuery } from '@constructorfleet/ultimate-govee/domain/channels/rest/queries';
import { LinkDeviceProductCommand } from '../commands';
import { DeviceConfigReceivedEvent } from '../events';

@CommandHandler(LinkDeviceProductCommand)
export class LinkDeviceProductCommandHandler
  implements ICommandHandler<LinkDeviceProductCommand, void>
{
  constructor(
    readonly queryBus: QueryBus,
    readonly eventBus: EventBus,
  ) {}

  async execute(command: LinkDeviceProductCommand): Promise<void> {
    const product = await this.queryBus.execute(
      new ModelProductQuery(command.device),
    );

    if (!product) {
      return;
    }

    this.eventBus.publish(
      new DeviceConfigReceivedEvent(command.device, product),
    );
  }
}
