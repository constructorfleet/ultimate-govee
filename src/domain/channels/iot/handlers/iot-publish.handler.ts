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
import { map, timer, takeUntil } from 'rxjs';
import { ModuleDestroyObservable } from '@govee/common';

@CommandHandler(IoTPublishCommand)
@EventsHandler(CommandExpiredEvent)
export class IoTPublishCommandHandler
  implements
    ICommandHandler<IoTPublishCommand, void>,
    IEventHandler<CommandExpiredEvent>
{
  private readonly logger: Logger = new Logger(IoTPublishCommandHandler.name);
  private expiredIds: string[] = [];

  constructor(
    private readonly service: IoTService,
    private readonly moduleDestroyed$: ModuleDestroyObservable,
  ) {}

  handle(event: CommandExpiredEvent) {
    this.expiredIds.push(event.commandId);
    timer(5000)
      .pipe(
        takeUntil(this.moduleDestroyed$),
        map(() => event.commandId),
      )
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
      this.logger.debug(`Sending to ${command.topic}`);
      this.service.send(command.topic, JSON.stringify(command.payload));
    }
    return Promise.resolve();
  }
}
