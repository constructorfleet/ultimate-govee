import { IoTData } from '@govee/data';
import { Labelled } from '@govee/common';
import { ChannelConfigReceivedEvent } from '../../channel-config-received.event';

export class IoTChannelConfigReceivedEvent
  extends ChannelConfigReceivedEvent<'iot', IoTData>
  implements Labelled
{
  label = 'IoT Channel Config Received';

  constructor(iotData: IoTData) {
    super('iot', iotData);
  }
}
