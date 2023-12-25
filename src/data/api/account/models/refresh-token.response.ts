export type RefreshToken = {
  refreshToken: string;
  token: string;
  tokenExpireCycle: number;
};

export type RefreshTokenResponse = {
  data: RefreshToken;
};
