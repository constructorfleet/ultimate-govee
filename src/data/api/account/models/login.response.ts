import { Expose, Transform, Type } from 'class-transformer';
import { GoveeAPIResponse } from '../../govee-api.models';

export class ClientData {
  @Expose({ name: 'A' })
  A?: string;

  @Expose({ name: 'B' })
  B?: string;

  @Expose({ name: 'topic' })
  topic!: string;

  @Expose({ name: 'token' })
  accessToken!: string;

  @Expose({ name: 'refreshToken' })
  refreshToken!: string;

  @Expose({ name: 'tokenExpireCycle' })
  tokenExpireCycle!: number;

  @Expose({ name: 'client' })
  clientId!: string;

  @Expose({ name: 'accountId' })
  @Transform(({ value }) => value.toString(), { toClassOnly: true })
  @Transform(({ value }) => parseInt(value, 10), { toPlainOnly: true })
  accountId!: string;

  @Expose({ name: 'pushToken' })
  pushToken?: string;

  @Expose({ name: 'versionCode' })
  versionCode?: string;

  @Expose({ name: 'versionName' })
  versionName?: string;

  @Expose({ name: 'sysVersion' })
  sysVersion?: string;

  @Expose({ name: 'isSavvyUser' })
  isSavvyUser?: boolean;
}

export class LoginResponse extends GoveeAPIResponse {
  @Expose({ name: 'client' })
  @Type(() => ClientData)
  client!: ClientData;
}
