import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import MomentLib from 'moment';
import {
  GoveeApiAuthenticationError,
  GoveeCommunityApiAuthenticationError,
  GoveeError,
} from '~ultimate-govee-common';
import { InjectPersisted, PersistResult } from '~ultimate-govee-persist';
import { parseP12Certificate, request } from '../../utils';
import {
  GoveeAccountConfig,
  GoveeCredentials,
} from './govee-account.configuration';
import { GoveeAccount, OAuthData } from './models/account-client';
import { IoTCertificateResponse } from './models/iot-certificate.response';
import { decodeJWT } from './models/jwt';
import { CommunityLoginResponse, LoginResponse } from './models/login.response';
import { RefreshTokenResponse } from './models/refresh-token.response';

@Injectable()
export class GoveeAccountService {
  private logger: Logger = new Logger(GoveeAccountService.name);
  private readonly persistedAccount: GoveeAccount;

  constructor(
    @Inject(GoveeAccountConfig.KEY)
    private readonly config: ConfigType<typeof GoveeAccountConfig>,
    @InjectPersisted({
      filename: 'govee.accountClient.json',
    })
    persistedAccount: GoveeAccount | undefined,
  ) {
    this.persistedAccount = persistedAccount ?? {
      accountId: '',
      clientId: '',
      topic: '',
      iot: undefined,
      oauth: undefined,
      bffOAuth: undefined,
    };
  }

  public isTokenValid(token?: string): boolean {
    const jwt = decodeJWT(token);
    try {
      if (!jwt?.exp || !jwt?.iat) {
        return false;
      }
      const expirationDateUTC = new Date(1970, 1, 1).setSeconds(jwt.exp);
      const nowUTC = new Date().getTime();
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
      this.logger.error('Unable to refresh token.', err);
      throw new Error('Unable to refresh token.');
    }
  }

  @PersistResult({
    filename: 'govee.accountClient.json',
  })
  async authenticate(credentials: GoveeCredentials): Promise<GoveeAccount> {
    if (await this.authenticateWithGovee(credentials)) {
      await this.authenticateWithAWSIoT();
    }
    await this.authenticateWithCommunity(credentials);

    return this.persistedAccount;
  }

  private async authenticateWithGovee(
    credentials: GoveeCredentials,
  ): Promise<boolean> {
    if (
      this.persistedAccount?.oauth &&
      MomentLib(this.persistedAccount.oauth.expiresAt).isAfter(
        MomentLib().utc().subtract(1, 'day'),
      ) &&
      this.isTokenValid(this.persistedAccount.oauth.accessToken)
    ) {
      this.logger.log('Using persisted Govee API credentials');
      return false;
    }
    try {
      this.logger.log('Authenticating with Govee REST API');
      const response = await request(
        this.config.authUrl,
        {},
        {
          email: credentials.username,
          password: credentials.password,
          client: credentials.clientId,
        },
      ).post(LoginResponse);
      const loginResponse = response.data;
      this.persistedAccount.accountId = loginResponse.client.accountId;
      this.persistedAccount.clientId = loginResponse.client.clientId;
      this.persistedAccount.topic = loginResponse.client.topic;
      this.persistedAccount.oauth = {
        accessToken: loginResponse.client.accessToken,
        refreshToken: loginResponse.client.refreshToken,
        expiresAt:
          new Date().getTime() + loginResponse.client.tokenExpireCycle * 1000,
        clientId: loginResponse.client.clientId,
      };

      return true;
    } catch (error) {
      this.logger.error(
        'Unable to authenticate with Govee servers',
        (error as Error).message,
      );
      throw new GoveeApiAuthenticationError();
    }
  }

  private async authenticateWithCommunity(
    credentials: GoveeCredentials,
  ): Promise<boolean> {
    if (
      this.persistedAccount.bffOAuth &&
      MomentLib(this.persistedAccount.bffOAuth.expiresAt).isAfter(
        MomentLib().utc().subtract(1, 'day'),
      ) &&
      this.isTokenValid(this.persistedAccount.bffOAuth.accessToken)
    ) {
      this.logger.log('Using persisted Govee Community credentials');
      return false;
    }

    try {
      this.logger.log('Authenticating with Govee Community API');
      const response = await request(
        this.config.communityAuthUrl,
        {},
        {
          email: credentials.username,
          password: credentials.password,
        },
      ).post(CommunityLoginResponse);
      const loginResponse = response.data;
      this.persistedAccount.bffOAuth = {
        accessToken: loginResponse.community.token,
        refreshToken: '',
        expiresAt: loginResponse.community.expiresAt,
        clientId: this.persistedAccount.clientId,
      };
      return true;
    } catch (error) {
      this.logger.error(
        'Unable to authenticate with Govee community servers',
        (error as Error).message,
      );
      throw new GoveeCommunityApiAuthenticationError();
    }
  }

  private async authenticateWithAWSIoT() {
    try {
      if (!this.persistedAccount.oauth) {
        this.logger.error('Cannot retreive IoT certificate: not logged in');
        throw new GoveeError('Unable to authenticate with AWS IoT broker');
      }
      this.logger.log('Getting IoT authentication information');
      const response = await request(
        this.config.iotCertUrl,
        this.config.authenticatedHeaders(this.persistedAccount.oauth),
      ).get(IoTCertificateResponse);
      const iotCertResponse: IoTCertificateResponse =
        response.data as IoTCertificateResponse;
      const iotCertificate = await parseP12Certificate(
        iotCertResponse.iotData.p12Certificate,
        iotCertResponse.iotData.certificatePassword,
      );
      this.persistedAccount.iot = {
        ...iotCertificate,
        endpoint: iotCertResponse.iotData.brokerUrl,
        accountId: this.persistedAccount.accountId,
        clientId: this.persistedAccount.clientId,
        topic: this.persistedAccount.topic,
      };
    } catch (err) {
      this.logger.error('Unable to retrieve IoT certificate', err);
      throw new Error('Unable to retrieve IoT certificate');
    }
  }
}
