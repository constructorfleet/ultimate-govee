import { Credentials, Labelled } from '~ultimate-govee-common';

export class SetCredentialsCommand implements Labelled {
  label = 'Set Credentials';

  constructor(readonly credentials: Credentials) {}
}
