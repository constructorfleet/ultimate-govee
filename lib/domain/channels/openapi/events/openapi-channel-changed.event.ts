import { Labelled } from '~ultimate-govee-common';
import { IoTData, OnOpenAPIMqttMessageCallback } from '~ultimate-govee-data';

export class OpenAPIChannelChangedEvent implements Labelled {
  label = 'OpenAPI Channel Changed';

  constructor(
    readonly enabled: boolean,
    readonly iotData: IoTData,
    readonly callback: OnOpenAPIMqttMessageCallback,
  ) {}

  equals(other: OpenAPIChannelChangedEvent) {
    return (
      other.enabled === this.enabled &&
      Object.entries(this.iotData).every(([k, v]) => other.iotData[k] === v)
    );
  }
}
