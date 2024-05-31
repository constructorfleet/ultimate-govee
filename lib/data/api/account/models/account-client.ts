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

export type GoveeAccount = {
  accountId: string;
  clientId: string;
  topic: string;
  iot?: IoTData;
  oauth?: OAuthData;
  bffOAuth?: OAuthData;
};
