import {
  ClientId,
  Labelled,
  Password,
  Username,
} from '@constructorfleet/ultimate-govee/common';

export class AuthenticateCommand implements Labelled {
  label = 'Authenticate';

  constructor(
    readonly username: Username,
    readonly password: Password,
    readonly clientId: ClientId,
  ) {}
}
