import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IoTService } from '@govee/data';
import { IoTPublishCommand } from '../commands';

@CommandHandler(IoTPublishCommand)
export class IoTPublishCommandHandler
  implements ICommandHandler<IoTPublishCommand>
{
  constructor(private readonly service: IoTService) {}
  async execute(command: IoTPublishCommand): Promise<any> {
    await this.service.send(command.topic, JSON.stringify(command.payload));
  }
}
