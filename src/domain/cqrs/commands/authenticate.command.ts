export class AuthenticateCommand {
  constructor(
    readonly username: string,
    readonly password: string,
  ) {}
}
