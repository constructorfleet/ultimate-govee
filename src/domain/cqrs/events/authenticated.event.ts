import { OAuthData } from '@govee/data';

export class AuthenticatedEvent {
  constructor(
    readonly accountId: string,
    readonly clientId: string,
    readonly oauthData: OAuthData,
  ) {}
}
