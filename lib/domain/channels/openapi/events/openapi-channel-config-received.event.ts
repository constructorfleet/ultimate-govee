import { Labelled } from '~ultimate-govee-common';
import { ChannelConfigReceivedEvent } from '../../channel-config-received.event';
import { OpenApiChannelConfiguration } from '../openapi-channel.types';

export class OpenAPIChannelConfigReceivedEvent
  extends ChannelConfigReceivedEvent<'openapi', OpenApiChannelConfiguration>
  implements Labelled
{
  label = 'IoT Channel Config Received';

  constructor(config: OpenApiChannelConfiguration) {
    super('openapi', config);
  }
}
