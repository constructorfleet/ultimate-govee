import { Expose } from 'class-transformer';
import { GoveeAPIResponse } from '../../govee-api.models';

export class RefreshToken {
  @Expose({ name: 'refreshToken' })
  refreshToken!: string;

  @Expose({ name: 'token' })
  token!: string;

  @Expose({ name: 'tokenExpireCycle' })
  tokenExpireCycle!: number;
}

export class RefreshTokenResponse extends GoveeAPIResponse {
  @Expose({ name: 'data' })
  data!: RefreshToken;
}
