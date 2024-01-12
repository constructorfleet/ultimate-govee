import { Logger } from '@nestjs/common';
import {
  Expose,
  Type,
  Transform,
  plainToInstance,
  instanceToPlain,
} from 'class-transformer';
import { jwtDecode } from 'jwt-decode';

export class JWTHeader {
  @Expose({ name: 'alg' })
  algorithm?: string;

  @Expose({ name: 'typ' })
  type?: string;
}

export class JWTPayloadDataAccount {
  @Expose({ name: 'client' })
  client?: string;

  @Expose({ name: 'sid' })
  sid?: string;

  @Expose({ name: 'accountId' })
  accountId?: string;

  @Expose({ name: 'email' })
  email?: string;
}

export class JWTPayloadData {
  @Type(() => JWTPayloadDataAccount)
  @Expose({ name: 'account' })
  @Transform(
    (params) =>
      plainToInstance(JWTPayloadDataAccount, JSON.parse(params.value)),
    {
      toClassOnly: true,
    },
  )
  @Transform((params) => JSON.stringify(instanceToPlain(params.value)), {
    toPlainOnly: true,
  })
  account?: string;
}

export class JWTPayload {
  @Expose({ name: 'data' })
  @Type(() => JWTPayloadData)
  data?: JWTPayloadData;

  @Expose({ name: 'iat' })
  iat?: number;

  @Expose({ name: 'exp' })
  exp?: number;
}

export const decodeJWT = (token?: string): JWTPayload | undefined => {
  if (!token) {
    return undefined;
  }
  try {
    return jwtDecode<JWTPayload>(token, {});
  } catch (error) {
    new Logger('decodeJWT').error('RestClient', 'decodeJWT', error);
    return undefined;
  }
};
