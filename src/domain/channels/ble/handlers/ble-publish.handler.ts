import {
  CommandHandler,
  EventsHandler,
  ICommandHandler,
  IEventHandler,
} from '@nestjs/cqrs';
import { BlePublishCommand } from '../commands';
import { Logger } from '@nestjs/common';
import { BleChannelService } from '../ble-channel.service';
import {
  CommandExpiredEvent,
  DeviceStatusReceivedEvent,
} from '@govee/domain/devices/cqrs';
import { Subject, map, reduce, timer } from 'rxjs';
import { EventBus } from '@nestjs/cqrs';

@CommandHandler(BlePublishCommand)
@EventsHandler(CommandExpiredEvent)
export class BlePublishCommandHandler
  implements
    ICommandHandler<BlePublishCommand>,
    IEventHandler<CommandExpiredEvent>
{
  private readonly logger = new Logger(BlePublishCommandHandler.name);
  private expiredIds: string[] = [];

  constructor(
    private readonly eventBus: EventBus,
    private readonly service: BleChannelService,
  ) {}

  handle(event: CommandExpiredEvent) {
    this.expiredIds.push(event.commandId);
    timer(5000)
      .pipe(map(() => event.commandId))
      .subscribe((id) =>
        this.expiredIds.splice(this.expiredIds.indexOf(id), 1),
      );
  }

  async execute(command: BlePublishCommand): Promise<any> {
    const results$ = new Subject<number[]>();
    results$
      .pipe(
        reduce((acc, opCode) => [...acc, opCode], [] as number[][]),
        map((commands) => ({
          id: command.id,
          cmd: 'status',
          model: '',
          pactCode: 0,
          pactType: 1,
          state: {},
          op: {
            command: commands,
          },
        })),
        map((status) => new DeviceStatusReceivedEvent(status)),
      )
      .subscribe((event) => this.eventBus.publish(event));

    this.service.sendCommand(
      command.id,
      command.bleAddress,
      command.commands,
      results$,
    );
  }
}
