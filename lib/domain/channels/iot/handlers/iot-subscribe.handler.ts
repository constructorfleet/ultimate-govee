import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IoTService } from '@constructorfleet/ultimate-govee/data';
import { IoTSubscribeCommand } from '../commands';

@CommandHandler(IoTSubscribeCommand)
export class IoTSubscribeCommandHandler
  implements ICommandHandler<IoTSubscribeCommand, void>
{
  constructor(private readonly iot: IoTService) {}

  async execute(command: IoTSubscribeCommand): Promise<void> {
    await this.iot.subscribe(command.topic);
  }
}
