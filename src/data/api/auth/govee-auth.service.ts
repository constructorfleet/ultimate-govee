import { Inject, Injectable, Logger } from '@nestjs/common';
import { GoveeAuthConfig, GoveeCredentials } from './govee-auth.configuration';
import axios from 'axios';
import { LoginResponse } from './models/login.response';
import { AccountClient } from './models/account-client';

@Injectable()
export class GoveeAuthService {
  private logger: Logger = new Logger(GoveeAuthService.name);

  constructor(
    @Inject(GoveeAuthConfig) private readonly config: GoveeAuthConfig,
  ) {}

  async authenticate(credentials: GoveeCredentials): Promise<AccountClient> {
    try {
      const response = await axios.post<LoginResponse>(
        this.config.authUrl,
        {
          email: credentials.username,
          password: credentials.password,
          client: credentials.clientId,
        },
        {
          headers: this.config.headers(credentials),
        },
      );
      return {
        accountId: response.data.client.accountId,
        iotTopic: response.data.client.topic,
        clientId: response.data.client.client,
        oauth: {
          token: response.data.client.token,
          refreshToken: response.data.client.refreshToken,
          expiresAt:
            new Date().getTime() + response.data.client.tokenExpireCycle * 1000,
          clientId: response.data.client.client,
        },
      };
    } catch (err) {
      this.logger.error(`Unable to authenticate with Govee servers`, err);
      throw new Error(`Unable to authenticate`);
    }
  }
}
