import {
  CommandHandler,
  EventsHandler,
  ICommandHandler,
  IEventHandler,
} from '@nestjs/cqrs';
import { BlePublishCommand } from '../commands';
import { Logger } from '@nestjs/common';
import { BleChannelService } from '../ble-channel.service';
import { CommandExpiredEvent } from '@govee/domain/devices/cqrs';
import { interval, map, of, timer } from 'rxjs';

@CommandHandler(BlePublishCommand)
@EventsHandler(CommandExpiredEvent)
export class BlePublishCommandHandler
  implements
    ICommandHandler<BlePublishCommand>,
    IEventHandler<CommandExpiredEvent>
{
  private readonly logger = new Logger(BlePublishCommandHandler.name);
  private expiredIds: string[] = [];

  constructor(private readonly service: BleChannelService) {}

  handle(event: CommandExpiredEvent) {
    this.expiredIds.push(event.commandId);
    timer(5000)
      .pipe(map(() => event.commandId))
      .subscribe((id) =>
        this.expiredIds.splice(this.expiredIds.indexOf(id), 1),
      );
  }

  async execute(command: BlePublishCommand): Promise<any> {
    if (this.expiredIds.includes(command.commandId)) {
      this.expiredIds = this.expiredIds.splice(
        this.expiredIds.indexOf(command.commandId),
        1,
      );
      return;
    }
    this.service.sendCommand(
      command.id,
      command.bleAddress,
      command.commands,
      command.priority,
    );
  }
}
