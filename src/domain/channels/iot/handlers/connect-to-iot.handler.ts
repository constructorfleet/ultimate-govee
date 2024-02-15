import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IoTService } from '@govee/data';
import { ConnectToIoTCommand } from '../commands';

@CommandHandler(ConnectToIoTCommand)
export class ConnectToIoTCommandHandler
  implements ICommandHandler<ConnectToIoTCommand>
{
  constructor(private readonly iot: IoTService) {}

  execute(command: ConnectToIoTCommand): Promise<any> {
    return this.iot.connect(command.iotData, command.callback).then(() => {
      if (command.topic) {
        return this.iot.subscribe(command.topic);
      }
    });
  }
}
