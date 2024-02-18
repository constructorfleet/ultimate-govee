import { IoTData } from '@constructorfleet/ultimate-govee/data';
import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { CQRS } from '@constructorfleet/ultimate-govee/domain/devices';
import { ChannelService } from '../channel.service';
import { IoTChannelChangedEvent } from './events';
import { combineLatest, map } from 'rxjs';

@Injectable()
export class IoTChannelService extends ChannelService<IoTData, true> {
  readonly togglable: true = true as const;
  readonly name: 'iot' = 'iot' as const;

  constructor(eventBus: EventBus) {
    super(eventBus);
    combineLatest([this.onConfigChanged$, this.onEnabledChanged$])
      .pipe(
        map(
          ([iotData, enabled]) =>
            new IoTChannelChangedEvent(enabled, iotData, (status) =>
              this.eventBus.publish(new CQRS.DeviceStatusReceivedEvent(status)),
            ),
        ),
      )
      .subscribe((event) => this.eventBus.publish(event));
  }
}
