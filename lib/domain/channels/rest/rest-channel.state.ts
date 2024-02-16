import { AccountAuthData } from '../../auth/auth.state';
import { ChannelState } from '../channel.state';

export type RestChannelConfig = Omit<AccountAuthData, 'oauth'>;
export type RestChannelState = ChannelState<RestChannelConfig> &
  Pick<AccountAuthData, 'oauth'>;
