import { Credentials, Labelled } from '@govee/common';

export class CredentialsChangedEvent implements Labelled {
  label = 'Credentials Changed';

  constructor(readonly credentials: Required<Credentials>) {}
}
