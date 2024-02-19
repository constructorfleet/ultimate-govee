import { Labelled } from '~ultimate-govee-common';
import { RestChannelConfig } from '../rest-channel.types';
import { ChannelConfigReceivedEvent } from '../../channel-config-received.event';

export class RestChannelConfigReceivedEvent
  extends ChannelConfigReceivedEvent<'rest', RestChannelConfig>
  implements Labelled
{
  label = 'Rest Channel Config Received';
  constructor(config: RestChannelConfig) {
    super('rest', config);
  }
}
