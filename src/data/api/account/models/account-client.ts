export type OAuthData = {
  accessToken: string;
  refreshToken: string;
  clientId: string;
  expiresAt: number;
};

export type IoTData = {
  certificate: string;
  privateKey: string;
  ca: string;
  endpoint: string;
  clientId: string;
  topic: string;
};

export type AccountClient = {
  accountId: string;
  clientId: string;
  iot: IoTData;
  oauth: OAuthData;
};
