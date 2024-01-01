export class AccountAuthenticatedEvent {
  constructor(
    public readonly accountId: string,
    public readonly clientId: string,
    public readonly accessToken: string,
    public readonly expiresAt: number,
  ) {}
}
