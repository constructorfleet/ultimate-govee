export type OAuthData = {
  token: string;
  refreshToken: string;
  clientId: string;
  expiresAt: number;
};

export type AccountClient = {
  accountId: string;
  clientId: string;
  iotTopic?: string;
  oauth: OAuthData;
};
