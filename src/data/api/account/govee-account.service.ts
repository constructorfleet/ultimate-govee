import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  GoveeAccountConfig,
  GoveeCredentials,
} from './govee-account.configuration';
import { LoginResponse } from './models/login.response';
import { AccountClient, OAuthData } from './models/account-client';
import {
  IoTCertificateData,
  IoTCertificateResponse,
} from './models/iot-certificate.response';
import { parseP12Certificate, request } from '../../utils';
import { RefreshTokenResponse } from './models/refresh-token.response';
import { decodeJWT } from './models/jwt';
import { InjectPersisted, PersistResult } from '../../../persist';

@Injectable()
export class GoveeAccountService {
  private logger: Logger = new Logger(GoveeAccountService.name);

  constructor(
    @Inject(GoveeAccountConfig.KEY)
    private readonly config: ConfigType<typeof GoveeAccountConfig>,
    @InjectPersisted({
      filename: 'accountClient.json',
    })
    private accountClient: AccountClient | undefined,
  ) {}

  private isTokenValid(token?: string): boolean {
    const jwt = decodeJWT(token);
    try {
      if (!jwt?.exp || !jwt?.iat) {
        return false;
      }
      const expirationDateUTC = new Date(1970, 1, 1).setSeconds(jwt.exp);
      const nowUTC = new Date().getTime();
      this.logger.debug(
        'RestClient',
        'isTokenValid',
        expirationDateUTC,
        nowUTC,
      );
      return nowUTC < expirationDateUTC;
    } catch (error) {
      this.logger.error('RestClient', 'isTokenValid', error);
    }

    return false;
  }

  async refresh(oauth: OAuthData): Promise<OAuthData> {
    try {
      this.logger.log('Refreshing access token');
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

  @PersistResult({
    filename: 'accountClient.json',
  })
  async authenticate(credentials: GoveeCredentials): Promise<AccountClient> {
    let { clientId } = credentials;
    let topic: string;
    if (this.accountClient !== undefined) {
      if (this.isTokenValid(this.accountClient?.oauth?.accessToken)) {
        return this.accountClient;
      }
      this.accountClient.oauth = await this.refresh(this.accountClient.oauth);
      return this.accountClient;
    }
    this.accountClient = {
      accountId: '',
      oauth: {
        accessToken: '',
        refreshToken: '',
        clientId: credentials.clientId,
        expiresAt: 0,
      },
      clientId: credentials.clientId,
    };
    try {
      this.logger.log('Authenticating with Govee');
      const loginResponse = await request(
        this.config.authUrl,
        {},
        {
          email: credentials.username,
          password: credentials.password,
          client: credentials.clientId,
        },
      ).post(LoginResponse);
      clientId = loginResponse.data.client.clientId;
      this.accountClient.accountId = loginResponse.data.client.accountId;
      this.accountClient.oauth = {
        accessToken: loginResponse.data.client.accessToken,
        refreshToken: loginResponse.data.client.refreshToken,
        expiresAt:
          new Date().getTime() +
          loginResponse.data.client.tokenExpireCycle * 1000,
        clientId,
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
      const iotCertResponse = await this.getIoTCertificate(
        this.accountClient.oauth,
      );
      const iotCertificate = await parseP12Certificate(
        iotCertResponse.p12Certificate,
        iotCertResponse.certificatePassword,
      );
      this.accountClient.iot = {
        ...iotCertificate,
        accountId: this.accountClient.accountId,
        endpoint: iotCertResponse.brokerUrl,
        topic,
        clientId,
      };
    } catch (err) {
      this.logger.error(err);
      this.logger.error(`Unable to authenticate with Govee servers`, err);
      return this.accountClient;
    }
    return this.accountClient;
  }

  async getIoTCertificate(oauthData: OAuthData): Promise<IoTCertificateData> {
    try {
      this.logger.log('Getting IoT auth information');
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
