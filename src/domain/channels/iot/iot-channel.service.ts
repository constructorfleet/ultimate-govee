import { IoTData, GoveeDeviceStatus } from '@govee/data';
import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Subject } from 'rxjs';
import { CQRS } from '@govee/domain/devices';
import { ChannelService } from '../channel.service';
import { ChannelState } from '../channel.state';
import { IoTChannelChangedEvent } from './events';

export type IoTChannelState = ChannelState<IoTData>;

@Injectable()
export class IoTChannelService extends ChannelService<
  IoTData,
  IoTChannelState
> {
  private readonly status: Subject<GoveeDeviceStatus> = new Subject();

  constructor(eventBus: EventBus) {
    super(eventBus);
  }

  setEnabled(enabled: boolean) {
    // TODO
  }

  onConfigChange(config: IoTData) {
    this.eventBus.publish(
      new IoTChannelChangedEvent(config, (status) => {
        this.eventBus.publish(new CQRS.DeviceStatusReceivedEvent(status));
      }),
    );
  }
}
