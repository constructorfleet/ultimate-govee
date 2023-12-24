export class GetAccountQuery {
  constructor(
    readonly username: string,
    readonly password: string,
    readonly clientId: string,
  ) {}
}
