import { FactoryProvider } from '@nestjs/common';
import { LANConfig } from './lan.config';

export const CommandSocketKey = 'Socket.Command';
export const CommandSocket: FactoryProvider = {
  provide: CommandSocketKey,
  inject: [LANConfig.KEY],
  useFactory: () => undefined,
};
