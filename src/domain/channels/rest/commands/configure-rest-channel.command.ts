import { Labelled } from '@govee/common';
import { RestChannelConfig } from '../rest-channel.state';

export class ConfigureRestChannelCommand implements Labelled {
  label = 'Configure Rest Channel';

  constructor(readonly config: RestChannelConfig) {}
}
