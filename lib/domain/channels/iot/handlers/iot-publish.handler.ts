import {
  CommandHandler,
  EventsHandler,
  ICommandHandler,
  IEventHandler,
} from '@nestjs/cqrs';
import { IoTService } from '@constructorfleet/ultimate-govee/data';
import { Logger } from '@nestjs/common';
import { IoTPublishCommand } from '../commands';
import { CommandExpiredEvent } from '@constructorfleet/ultimate-govee/domain/devices/cqrs';
import { map, timer } from 'rxjs';
import stringify from 'json-stringify-safe';

@CommandHandler(IoTPublishCommand)
@EventsHandler(CommandExpiredEvent)
export class IoTPublishCommandHandler
  implements
    ICommandHandler<IoTPublishCommand, void>,
    IEventHandler<CommandExpiredEvent>
{
  private readonly logger: Logger = new Logger(IoTPublishCommandHandler.name);
  private expiredIds: string[] = [];

  constructor(private readonly service: IoTService) {}

  handle(event: CommandExpiredEvent) {
    this.expiredIds.push(event.commandId);
    timer(5000)
      .pipe(map(() => event.commandId))
      .subscribe((id) =>
        this.expiredIds.splice(this.expiredIds.indexOf(id), 1),
      );
  }

  execute(command: IoTPublishCommand): Promise<void> {
    if (this.expiredIds.includes(command.commandId)) {
      this.expiredIds = this.expiredIds.splice(
        this.expiredIds.indexOf(command.commandId),
        1,
      );
    } else {
      command.debug && this.logger.debug(`Sending to ${command.topic}`);
      command.debug && this.logger.debug(command.payload);
      this.service.send(command.topic, stringify(command.payload));
    }
    return Promise.resolve();
  }
}
