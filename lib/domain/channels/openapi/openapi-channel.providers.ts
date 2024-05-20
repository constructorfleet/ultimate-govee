import { FactoryProvider, Inject } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from './openapi-channel.types';
import { Optional } from '~ultimate-govee-common';

export const OpenAPIChannelConfigEnabledKey = 'Config.OpenAPIChannel.Enabled';
export const InjectEnabled = Inject(OpenAPIChannelConfigEnabledKey);
export const OpenAPIChannelConfigEnabledProvider: FactoryProvider = {
  provide: OpenAPIChannelConfigEnabledKey,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: typeof OPTIONS_TYPE): boolean =>
    options.enabled ?? false,
};

export const OpenAPIChannelConfigTopicKey = 'Config.OpenAPIChannel.Topic';
export const InjectOpenAPITopic = Inject(OpenAPIChannelConfigTopicKey);
export const OpenAPIChannelConfigTopicProvider: FactoryProvider = {
  provide: OpenAPIChannelConfigTopicKey,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: typeof OPTIONS_TYPE): Optional<string> =>
    options.apiKey !== undefined ? `GA/${options.apiKey}` : undefined,
};

export const OpenAPIChannelConfigCredentialsKey =
  'Config.OpenAPIChannel.Credentials';
export const InjectOpenAPICredentials = Inject(
  OpenAPIChannelConfigCredentialsKey,
);
export const OpenAPIChannelConfigCredentialsProvider: FactoryProvider = {
  provide: OpenAPIChannelConfigCredentialsKey,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (
    options: typeof OPTIONS_TYPE,
  ): Partial<{ username: string; password: string }> => ({
    username: options.apiKey,
    password: options.apiKey,
  }),
};

export const OpenApiTopicKey = 'Config.OpenAPIChannel.Topic';
export const InjectOpenApiTopic = Inject(OpenApiTopicKey);
export const OpenApiTopicProvider: FactoryProvider = {
  provide: OpenApiTopicKey,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: typeof OPTIONS_TYPE): string => `GA/${options.apiKey}`,
};

export const OpenAPIConfigKey = 'Config.OpenAPIChannel';
export const InjectOpenAPIConfig = Inject(OpenAPIConfigKey);
export const OpenApiChannelConfigProvider: FactoryProvider = {
  provide: OpenAPIConfigKey,
  inject: [
    OpenAPIChannelConfigTopicKey,
    OpenAPIChannelConfigCredentialsKey,
    OpenAPIChannelConfigEnabledKey,
  ],
  useFactory: (
    topic: string,
    credentials: { username: string; password: string },
    enabled: boolean,
  ) => ({
    topic,
    credentials,
    enabled,
  }),
};
