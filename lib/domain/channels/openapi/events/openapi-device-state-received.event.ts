import { Labelled } from '~ultimate-govee-common';
import { OpenAPIDevice } from '~ultimate-govee-data';

export class OpenAPIDeviceStateReceivedEvent implements Labelled {
  label = 'OpenAPI Device State Received';

  constructor(readonly deviceState: OpenAPIDevice) {}
}
