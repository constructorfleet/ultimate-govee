import { Labelled } from '@constructorfleet/ultimate-govee/common';
import {
  IoTData,
  OnIoTMessageCallback,
} from '@constructorfleet/ultimate-govee/data';

export class IoTChannelChangedEvent implements Labelled {
  label = 'IoT Channel Changed';

  constructor(
    readonly iotData: IoTData,
    readonly callback: OnIoTMessageCallback,
  ) {}

  equals(other: IoTChannelChangedEvent) {
    return Object.entries(this.iotData).every(
      ([k, v]) => other.iotData[k] === v,
    );
  }
}
