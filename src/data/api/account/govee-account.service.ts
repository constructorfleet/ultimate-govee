import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  GoveeAccountConfig,
  GoveeCredentials,
} from './govee-account.configuration';
import { LoginResponse } from './models/login.response';
import {
  AccountClient,
  OAuthData,
} from '../../../domain/models/account-client';
import {
  IoTCertificateData,
  IoTCertificateResponse,
} from './models/iot-certificate.response';
import { parseP12Certificate, request } from '../../utils';
import { RefreshTokenResponse } from './models/refresh-token.response';

@Injectable()
export class GoveeAccountService {
  private logger: Logger = new Logger(GoveeAccountService.name);

  constructor(
    @Inject(GoveeAccountConfig.KEY)
    private readonly config: ConfigType<typeof GoveeAccountConfig>,
  ) {}

  async refresh(oauth: OAuthData): Promise<OAuthData> {
    try {
      const response = await request(
        this.config.refreshTokenUrl,
        this.config.authenticatedHeaders(oauth),
      ).get(RefreshTokenResponse);
      return {
        accessToken: (response.data as RefreshTokenResponse).data.token,
        refreshToken: (response.data as RefreshTokenResponse).data.refreshToken,
        expiresAt:
          new Date().getTime() +
          (response.data as RefreshTokenResponse).data.tokenExpireCycle * 1000,
        clientId: oauth.clientId,
      };
    } catch (err) {
      this.logger.error(`Unable to refresh token.`, err);
      throw new Error(`Unable to refresh token.`);
    }
  }

  async authenticate(credentials: GoveeCredentials): Promise<AccountClient> {
    const accountClient: AccountClient = {
      clientId: '',
      accountId: '',
      oauth: {
        accessToken: '',
        refreshToken: '',
        expiresAt: 0,
        clientId: '',
      },
    };
    let topic: string;
    try {
      const loginResponse = await request(
        this.config.authUrl,
        {},
        {
          email: credentials.username,
          password: credentials.password,
          client: credentials.clientId,
        },
      ).post(LoginResponse);
      accountClient.accountId = loginResponse.data.client.accountId;
      accountClient.oauth = {
        accessToken: loginResponse.data.client.accessToken,
        refreshToken: loginResponse.data.client.refreshToken,
        expiresAt:
          new Date().getTime() +
          loginResponse.data.client.tokenExpireCycle * 1000,
        clientId: loginResponse.data.client.clientId,
      };
      topic = loginResponse.data.client.topic;
    } catch (err) {
      this.logger.error(
        `Unable to authenticate with Govee. ${JSON.stringify(
          credentials,
        )} ${err}`,
        err,
      );
      throw new Error(`Unable to authenticate with Govee.`);
    }

    try {
      const iotCertResponse = await this.getIoTCertificate(accountClient.oauth);
      const iotCertificate = await parseP12Certificate(
        iotCertResponse.p12Certificate,
        iotCertResponse.certificatePassword,
      );
      accountClient.iot = {
        ...iotCertificate,
        accountId: accountClient.accountId,
        endpoint: iotCertResponse.brokerUrl,
        topic,
        clientId: accountClient.clientId,
      };
    } catch (err) {
      this.logger.error(err);
      this.logger.error(`Unable to authenticate with Govee servers`, err);
      return accountClient;
    }

    return accountClient;
  }

  async getIoTCertificate(oauthData: OAuthData): Promise<IoTCertificateData> {
    try {
      const response = await request(
        this.config.iotCertUrl,
        this.config.authenticatedHeaders(oauthData),
      ).get(IoTCertificateResponse);
      return (response.data as IoTCertificateResponse).data;
    } catch (err) {
      this.logger.error(`Unable to retrieve IoT certificate`, err);
      throw new Error(`Unable to retrieve IoT certificate`);
    }
  }
}
