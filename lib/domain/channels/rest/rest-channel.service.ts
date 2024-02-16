import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ChannelService } from '../channel.service';
import { RestChannelChangedEvent } from './events/rest-channel-changed.event';
import { RestChannelConfig, RestChannelState } from './rest-channel.state';

@Injectable()
export class RestChannelService extends ChannelService<
  RestChannelConfig,
  RestChannelState
> {
  private readonly logger: Logger = new Logger(RestChannelService.name);

  constructor(eventBus: EventBus) {
    super(eventBus);
  }

  onConfigChange(config: RestChannelConfig) {
    this.eventBus.publish(new RestChannelChangedEvent(config));
  }
}
