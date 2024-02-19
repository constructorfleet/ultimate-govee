import { Labelled } from '~ultimate-govee-common';
import { IoTData } from '~ultimate-govee-data';

export class ConfigureIoTChannelCommand implements Labelled {
  label = 'Configure IoT Channel';

  constructor(readonly config: IoTData) {}
}
