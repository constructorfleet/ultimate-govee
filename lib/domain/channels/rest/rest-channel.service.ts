import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ChannelService } from '../channel.service';
import { RestChannelChangedEvent } from './events/rest-channel-changed.event';
import { RestChannelConfig } from './rest-channel.state';

@Injectable()
export class RestChannelService extends ChannelService<
  RestChannelConfig,
  false
> {
  togglable: false = false as const;
  name: 'restChannel' = 'restChannel' as const;
  constructor(eventBus: EventBus) {
    super(eventBus, true);
    this.onConfigChanged$.subscribe((config) => {
      this.eventBus.publish(new RestChannelChangedEvent(config));
    });
  }
}
