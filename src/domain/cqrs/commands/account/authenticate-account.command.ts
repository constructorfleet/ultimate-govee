export class AuthenticateAccountCommand {
  constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly clientId: string,
  ) {}
}
