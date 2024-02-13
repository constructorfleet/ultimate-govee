import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IoTService } from '@govee/data';
import { Logger } from '@nestjs/common';
import { IoTPublishCommand } from '../commands';

@CommandHandler(IoTPublishCommand)
export class IoTPublishCommandHandler
  implements ICommandHandler<IoTPublishCommand>
{
  private readonly logger: Logger = new Logger(IoTPublishCommandHandler.name);
  constructor(private readonly service: IoTService) {}
  async execute(command: IoTPublishCommand): Promise<any> {
    this.logger.debug(`Sending to ${command.topic}`);
    await this.service.send(command.topic, JSON.stringify(command.payload));
  }
}
