import { Credentials, Labelled } from '@govee/common';

export class SetCredentialsCommand implements Labelled {
  label = 'Set Credentials';

  constructor(readonly credentials: Credentials) {}
}
