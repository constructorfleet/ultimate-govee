import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IoTService } from '@govee/data';
import { IoTSubscribeCommand } from '../commands';

@CommandHandler(IoTSubscribeCommand)
export class IoTSubscribeCommandHandler
  implements ICommandHandler<IoTSubscribeCommand>
{
  constructor(private readonly iot: IoTService) {}

  async execute(command: IoTSubscribeCommand): Promise<any> {
    await this.iot.subscribe(command.topic);
  }
}