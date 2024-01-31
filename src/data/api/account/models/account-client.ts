export type OAuthData = {
  accessToken: string;
  refreshToken: string;
  clientId: string;
  expiresAt: number;
};

export type IoTData = {
  certificate: string;
  privateKey: string;
  endpoint: string;
  accountId: string;
  clientId: string;
  topic: string;
};

export type AccountState = {
  accountId: string;
  clientId: string;
  iot?: IoTData;
  oauth: OAuthData;
};
