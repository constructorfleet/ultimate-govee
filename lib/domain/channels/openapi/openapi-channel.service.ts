import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import stringify from 'json-stringify-safe';
import { combineLatest, concatMap, from } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { GoveeDeviceStatus, OpenAPIService } from '~ultimate-govee-data';
import { DeviceRefeshEvent } from '../../devices/cqrs/events/device-refresh.event';
import { DeviceStateCommandEvent } from '../../devices/cqrs/events/device-state-command.event';
import { DeviceStatusReceivedEvent } from '../../devices/cqrs/events/device-status-received.event';
import { ChannelService } from '../channel.service';
import { InjectEnabled } from './openapi-channel.providers';
import { OpenApiChannelConfiguration } from './openapi-channel.types';

@EventsHandler(DeviceRefeshEvent, DeviceStateCommandEvent)
@Injectable()
export class OpenApiChannelService
  extends ChannelService<OpenApiChannelConfiguration, true>
  implements
    OnModuleDestroy,
    IEventHandler<DeviceRefeshEvent>,
    IEventHandler<DeviceStateCommandEvent>
{
  readonly togglable: true = true as const;
  readonly name: 'openapi' = 'openapi' as const;

  constructor(
    @InjectEnabled enabled: boolean,
    private readonly openapi: OpenAPIService,
    eventBus: EventBus,
  ) {
    super(eventBus, enabled);
    combineLatest([this.onConfigChanged$, this.onEnabledChanged$])
      .pipe(
        concatMap(([openapiData, enabled]) => {
          if (enabled) {
            return from(this.connect(openapiData));
          }
          return from(this.disconnect());
        }),
      )
      .subscribe();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async disconnect() {
    await this.openapi.disconnect();
  }

  async connect(config: OpenApiChannelConfiguration) {
    this.openapi.setApiKey(config.apiKey);
    this.openapi.setMqttCallback(async (message: GoveeDeviceStatus) => {
      await this.eventBus.publish(new DeviceStatusReceivedEvent(message));
    });
    await this.openapi.connect();
  }

  private get accountTopic(): string | undefined {
    return `GA/${this.getConfig()?.apiKey}`;
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
            accountTopic: this.accountTopic,
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
          accountTopic: this.accountTopic,
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

  async publishMessage(
    commandId: string,
    topic: string,
    payload: object,
    debug?: boolean,
  ) {
    if (debug === true) {
      this.logger.debug(topic, payload);
    }
    return await this.openapi.sendMessage(
      topic,
      Buffer.from(stringify(payload)),
    );
  }
}
