import { AccountAuthData } from '../../auth/auth.state';

export type RestChannelConfig = Omit<AccountAuthData, 'oauth'>;
