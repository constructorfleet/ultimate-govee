import { OAuthData } from "@govee/data";

export class RefreshAuthenticationCommand {
  constructor(readonly oauth: OAuthData) {}
}