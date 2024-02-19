import { ConfigurableModuleBuilder } from '@nestjs/common';
export type AuthModuleOptions = {
  refreshMargin?: number;
};

export const {
  ConfigurableModuleClass,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<AuthModuleOptions>({
  optionsInjectionToken: 'Auth.Module.Options',
})
  .setClassMethodName('forRoot')
  .setExtras({ isGlobal: true }, (definition, extras) => ({
    ...definition,
    global: extras.isGlobal,
  }))
  .build();
