import { Labelled } from '@govee/common';
import { IoTData } from '@govee/data';

export class ConfigureIoTChannelCommand implements Labelled {
  label = 'Configure IoT Channel';

  constructor(readonly config: IoTData) {}
}
