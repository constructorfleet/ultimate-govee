import {
  CommandHandler,
  EventBus,
  EventsHandler,
  ICommandHandler,
  IEventHandler,
} from '@nestjs/cqrs';
import { IoTService } from '@govee/data';
import { Logger } from '@nestjs/common';
import { IoTPublishCommand } from '../commands';
import { CommandExpiredEvent } from '@govee/domain/devices/cqrs';
import { map, timer } from 'rxjs';

@CommandHandler(IoTPublishCommand)
@EventsHandler(CommandExpiredEvent)
export class IoTPublishCommandHandler
  implements
    ICommandHandler<IoTPublishCommand>,
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

  async execute(command: IoTPublishCommand): Promise<any> {
    if (this.expiredIds.includes(command.commandId)) {
      this.expiredIds = this.expiredIds.splice(
        this.expiredIds.indexOf(command.commandId),
        1,
      );
      return;
    }
    this.logger.debug(`Sending to ${command.topic}`);
    await this.service.send(command.topic, JSON.stringify(command.payload));
  }
}
