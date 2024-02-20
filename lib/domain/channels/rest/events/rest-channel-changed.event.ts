import { Labelled } from '~ultimate-govee-common';
import { RestChannelConfig } from '../rest-channel.types';

export class RestChannelChangedEvent implements Labelled {
  label = 'Rest Channel Changed';

  constructor(readonly config: RestChannelConfig) {}
}
