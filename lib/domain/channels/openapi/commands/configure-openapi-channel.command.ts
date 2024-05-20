import { Labelled } from '~ultimate-govee-common';
import { OpenApiChannelConfiguration } from './../openapi-channel.types';

export class ConfigureOpenAPIChannelCommand implements Labelled {
  label = 'Configure OpenAPI Channel';

  constructor(readonly config: OpenApiChannelConfiguration) {}
}
