import { FactoryProvider, Inject } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from './auth.types';

export const DEFAULT_AUTH_REFRESH_MARGIN = 60 * 1000; // 1 minute
export const AuthRefreshMarginKey = 'Auth.Refresh.Margin';
export const InjectRefreshMargin = Inject(AuthRefreshMarginKey);
export const AuthRefreshMarginProvider: FactoryProvider = {
  provide: AuthRefreshMarginKey,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: typeof OPTIONS_TYPE): number =>
    options.refreshMargin ?? DEFAULT_AUTH_REFRESH_MARGIN,
};
