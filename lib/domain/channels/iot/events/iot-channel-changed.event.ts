import { Labelled } from '~ultimate-govee/common';
import { IoTData, OnIoTMessageCallback } from '~ultimate-govee/data';

export class IoTChannelChangedEvent implements Labelled {
  label = 'IoT Channel Changed';

  constructor(
    readonly enabled: boolean,
    readonly iotData: IoTData,
    readonly callback: OnIoTMessageCallback,
  ) {}

  equals(other: IoTChannelChangedEvent) {
    return (
      other.enabled === this.enabled &&
      Object.entries(this.iotData).every(([k, v]) => other.iotData[k] === v)
    );
  }
}
