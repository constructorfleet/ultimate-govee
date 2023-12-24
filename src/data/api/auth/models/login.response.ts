import { GoveeAPIResponse } from '../../govee-api.models';

export type ClientData = {
  A: string;
  B: string;
  topic?: string;
  token: string;
  refreshToken: string;
  tokenExpireCycle: number;
  client: string;
  accountId: string;
  pushToken: string;
  versionCode: string;
  versionName: string;
  sysVersion: string;
  isSavvyUser: boolean;
};

export type LoginResponse = {
  client: ClientData;
} & GoveeAPIResponse;
