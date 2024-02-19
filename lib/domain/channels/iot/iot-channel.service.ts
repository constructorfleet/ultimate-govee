import { IoTData, IoTService } from '~ultimate-govee-data';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import stringify from 'json-stringify-safe';
import { ChannelService } from '../channel.service';
import { combineLatest, switchMap } from 'rxjs';
import { DeviceStatusReceivedEvent } from '../../devices/cqrs/events/device-status-received.event';
import { DeviceRefeshEvent } from '../../devices/cqrs/events/device-refresh.event';
import { v4 as uuidv4 } from 'uuid';
import { DeviceStateCommandEvent } from '../../devices/cqrs/events/device-state-command.event';
import { InjectEnabled } from './iot-channel.providers';

@EventsHandler(DeviceRefeshEvent, DeviceStateCommandEvent)
@Injectable()
export class IoTChannelService
  extends ChannelService<IoTData, true>
  implements
    OnModuleDestroy,
    IEventHandler<DeviceRefeshEvent>,
    IEventHandler<DeviceStateCommandEvent>
{
  readonly togglable: true = true as const;
  readonly name: 'iot' = 'iot' as const;

  constructor(
    @InjectEnabled enabled: boolean,
    private readonly iot: IoTService,
    eventBus: EventBus,
  ) {
    super(eventBus, enabled);
    combineLatest([this.onConfigChanged$, this.onEnabledChanged$])
      .pipe(
        switchMap(([iotData, enabled]) =>
          enabled ? this.connect(iotData) : this.disconnect(),
        ),
      )
      .subscribe();
  }

  async handle(event: DeviceRefeshEvent | DeviceStateCommandEvent) {
    if (!this.isEnabled) {
      return;
    }
    if (event instanceof DeviceRefeshEvent) {
      if (event.addresses.iotTopic === undefined) {
        return;
      }
      return await this.publishMessage(
        uuidv4(),
        event.addresses.iotTopic!,
        {
          topic: event.addresses.iotTopic,
          msg: {
            accountTopic: this.getConfig()?.topic,
            cmd: 'status',
            cmdVersion: 0,
            transaction: `u_${Date.now()}`,
            type: 0,
          },
        },
        event.debug,
      );
    }
    if (event.addresses.iotTopic === undefined) {
      return;
    }
    return await this.publishMessage(
      event.command.commandId,
      event.addresses.iotTopic!,
      {
        topic: event.addresses.iotTopic,
        msg: {
          accountTopic: this.getConfig()?.topic,
          cmd: event.command.command ?? 'ptReal',
          cmdVersion: event.command.cmdVersion ?? 0,
          data: event.command.data,
          transaction: `u_${Date.now()}`,
          type: event.command.type ?? 1,
        },
      },
      event.debug,
    );
  }

  async disconnect() {
    await this.iot.disconnect();
  }

  async connect(iotData: IoTData, deviceIds?: string[]) {
    await this.iot.connect(iotData, (message) => {
      if (deviceIds === undefined || deviceIds?.includes(message.id) === true) {
        this.eventBus.publish(new DeviceStatusReceivedEvent(message));
      }
    });
    this.iot.subscribe(iotData.topic);
  }

  async publishMessage(
    commandId: string,
    topic: string,
    payload: object,
    debug?: boolean,
  ) {
    if (debug === true) {
      this.logger.debug(topic, payload);
    }
    return await this.iot.send(topic, stringify(payload));
  }

  async onModuleDestroy() {
    await this.disconnect();
  }
}
