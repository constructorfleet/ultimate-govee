import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GoveeAPIModule } from '~ultimate-govee-data';
import {
  AuthDataQueryHandler,
  AuthenticateCommandHandler,
  RefreshAuthenticationCommandHandler,
  SetCredentialsCommandHandler,
} from './handlers';
import { AuthSagas } from './auth.sagas';
import { AuthService } from './auth.service';
import { ConfigurableModuleClass } from './auth.types';
import { AuthRefreshMarginProvider } from './auth.providers';

@Module({
  imports: [CqrsModule, GoveeAPIModule],
  providers: [
    AuthRefreshMarginProvider,
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
export class AuthModule extends ConfigurableModuleClass {}
