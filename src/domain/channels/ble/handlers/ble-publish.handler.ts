import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlePublishCommand } from '../commands';
import { Logger } from '@nestjs/common';
import { BleChannelService } from '../ble-channel.service';

@CommandHandler(BlePublishCommand)
export class BlePublishCommandHandler
  implements ICommandHandler<BlePublishCommand>
{
  private readonly logger = new Logger(BlePublishCommandHandler.name);

  constructor(private readonly service: BleChannelService) {}

  async execute(command: BlePublishCommand): Promise<any> {
    this.service.sendCommand(command.id, command.bleAddress, command.commands);
  }
}
