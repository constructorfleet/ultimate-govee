import { Labelled } from '@constructorfleet/ultimate-govee/common';
import { IoTData } from '@constructorfleet/ultimate-govee/data';

export class ConfigureIoTChannelCommand implements Labelled {
  label = 'Configure IoT Channel';

  constructor(readonly config: IoTData) {}
}
