import { Labelled } from '~ultimate-govee-common';
import { RestChannelConfig } from '../rest-channel.types';

export class ConfigureRestChannelCommand implements Labelled {
  label = 'Configure Rest Channel';

  constructor(readonly config: RestChannelConfig) {}
}
