import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ChannelService } from '../channel.service';
import { RestChannelChangedEvent } from './events/rest-channel-changed.event';
import { RestChannelConfig } from './rest-channel.types';
import { InjectAuth } from './rest-channel.providers';

@Injectable()
export class RestChannelService extends ChannelService<
  RestChannelConfig,
  false
> {
  togglable: false = false as const;
  name: 'restChannel' = 'restChannel' as const;
  constructor(
    @InjectAuth enabled: boolean,
    @InjectAuth auth: RestChannelConfig,
    eventBus: EventBus,
  ) {
    super(eventBus, enabled, auth);
    this.onConfigChanged$.subscribe((config) => {
      this.eventBus.publish(new RestChannelChangedEvent(config));
    });
  }
}
