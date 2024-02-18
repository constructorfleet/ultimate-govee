import { IoTService } from '@constructorfleet/ultimate-govee/data';
import { DisconnectFromIoTCommand } from '../commands/disconnect-from-iot.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(DisconnectFromIoTCommand)
export class DisconnectFromIoTCommandHandler
  implements ICommandHandler<DisconnectFromIoTCommand>
{
  constructor(readonly iot: IoTService) {}

  async execute(): Promise<any> {
    await this.iot.disconnect();
  }
}
