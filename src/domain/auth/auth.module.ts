import { Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { GoveeAPIModule } from '@govee/data';
import { AuthConfig } from './auth.config';
import {
  AuthDataQueryHandler,
  AuthenticateCommandHandler,
  RefreshAuthenticationCommandHandler,
  SetCredentialsCommandHandler,
} from './handlers';
import { AuthSagas } from './auth.sagas';
import { AuthService } from './auth.service';

@Module({
  imports: [CqrsModule, ConfigModule.forFeature(AuthConfig), GoveeAPIModule],
  providers: [
    AuthenticateCommandHandler,
    RefreshAuthenticationCommandHandler,
    SetCredentialsCommandHandler,
    AuthDataQueryHandler,
    AuthSagas,
    AuthService,
  ],
  exports: [
    AuthenticateCommandHandler,
    RefreshAuthenticationCommandHandler,
    AuthDataQueryHandler,
    SetCredentialsCommandHandler,
    AuthSagas,
  ],
})
export class AuthModule {}
