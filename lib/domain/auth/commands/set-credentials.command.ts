import { Credentials, Labelled } from '@constructorfleet/ultimate-govee/common';

export class SetCredentialsCommand implements Labelled {
  label = 'Set Credentials';

  constructor(readonly credentials: Credentials) {}
}
