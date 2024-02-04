import { ClientId, Labelled, Password, Username } from '@govee/common';

export class AuthenticateCommand implements Labelled {
  label = 'Authenticate';

  constructor(
    readonly username: Username,
    readonly password: Password,
    readonly clientId: ClientId,
  ) {}
}
