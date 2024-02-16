import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IoTService } from '@constructorfleet/ultimate-govee/data';
import { ConnectToIoTCommand } from '../commands';

@CommandHandler(ConnectToIoTCommand)
export class ConnectToIoTCommandHandler
  implements ICommandHandler<ConnectToIoTCommand>
{
  constructor(private readonly iot: IoTService) {}

  async execute(command: ConnectToIoTCommand): Promise<any> {
    await this.iot.connect(command.iotData, command.callback);
    if (command.topic) {
      return this.iot.subscribe(command.topic);
    }
  }
}
