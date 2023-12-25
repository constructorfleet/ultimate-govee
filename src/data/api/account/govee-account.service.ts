import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import axios from 'axios';
import {
  GoveeAccountConfig,
  GoveeCredentials,
} from './govee-account.configuration';
import { LoginResponse } from './models/login.response';
import {
  AccountClient,
  OAuthData,
} from '../../../domain/models/account-client';
import { IoTCertificateData } from './models/iot-certificate.response';
import { parseP12Certificate } from '../../../utils';
import { RefreshTokenResponse } from './models/refresh-token.response';

@Injectable()
export class GoveeAuthService {
  private logger: Logger = new Logger(GoveeAuthService.name);

  constructor(
    @Inject(GoveeAccountConfig.KEY)
    private readonly config: ConfigType<typeof GoveeAccountConfig>,
  ) {}

  async refresh(oauth: OAuthData): Promise<OAuthData> {
    try {
      const response = await axios.get<RefreshTokenResponse>(
        this.config.refreshTokenUrl,
        {
          headers: this.config.authenticatedHeaders(oauth),
        },
      );
      return {
        accessToken: response.data.data.token,
        refreshToken: response.data.data.refreshToken,
        expiresAt:
          new Date().getTime() + response.data.data.tokenExpireCycle * 1000,
        clientId: oauth.clientId,
      };
    } catch (err) {
      this.logger.error(`Unable to refresh token.`, err);
      throw new Error(`Unable to refresh token.`);
    }
  }

  async authenticate(credentials: GoveeCredentials): Promise<AccountClient> {
    try {
      const loginResponse = await axios.post<LoginResponse>(
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
      const oauth: OAuthData = {
        accessToken: loginResponse.data.client.token,
        refreshToken: loginResponse.data.client.refreshToken,
        expiresAt:
          new Date().getTime() +
          loginResponse.data.client.tokenExpireCycle * 1000,
        clientId: loginResponse.data.client.client,
      };
      const iotCertResponse = await this.getIoTCertificate(oauth);
      const iotCertificate = await parseP12Certificate(
        iotCertResponse.p12,
        iotCertResponse.p12Pass,
      );
      return {
        accountId: loginResponse.data.client.accountId,
        clientId: loginResponse.data.client.client,
        oauth,
        iot: {
          ...iotCertificate,
          accountId: loginResponse.data.client.accountId,
          endpoint: iotCertResponse.endpoint,
          topic: loginResponse.data.client.topic,
          clientId: loginResponse.data.client.client,
        },
      };
    } catch (err) {
      this.logger.error(`Unable to authenticate with Govee servers`, err);
      throw new Error(`Unable to authenticate`);
    }
  }

  async getIoTCertificate(oauthData: OAuthData): Promise<IoTCertificateData> {
    try {
      const response = await axios.get<IoTCertificateData>(
        this.config.iotCertUrl,
        {
          headers: this.config.authenticatedHeaders(oauthData),
        },
      );
      return response.data;
    } catch (err) {
      this.logger.error(`Unable to retrieve IoT certificate`, err);
      throw new Error(`Unable to retrieve IoT certificate`);
    }
  }
}
