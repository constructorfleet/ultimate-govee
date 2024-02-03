import { ClientId, Password, Username } from '@govee/domain/accounts/accounts.state';

export class AuthenticateCommand {
  constructor(
    readonly username: Username,
    readonly password: Password,
    readonly clientId: ClientId,
  ) { }
}
