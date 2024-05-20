import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import stringify from 'json-stringify-safe';
import { combineLatest, concatMap, from } from 'rxjs';
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
    this.logger.log('Connecting to OpenAPI channel');
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
    switch (true) {
      case event instanceof DeviceRefeshEvent:
        // TODO : Implement once platform is more 'ready'
        return await Promise.resolve();
      case event instanceof DeviceStateCommandEvent:
        // TODO : Implement once platform is more 'ready'
        return await Promise.resolve();
    }
    return await Promise.reject('Unknown event');
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
