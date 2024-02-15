import { Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistModule } from './persist';
import { AppService } from './app.service';
import { DataModule } from './data';
import { AuthModule } from './domain/auth';
import { ChannelsModule } from './domain/channels';
import { CredentialsConfig } from './config/govee.config';
import { DevicesModule } from './domain/devices';
import { ModuleDestroyObservable } from './common';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PersistModule.forRoot(),
    CqrsModule.forRoot(),
    ConfigModule.forFeature(CredentialsConfig),
    AuthModule,
    ChannelsModule,
    DevicesModule,
  ],
  providers: [AppService, ModuleDestroyObservable],
})
export class AppModule implements OnModuleDestroy {
  constructor(private readonly moduleDestroyed$: ModuleDestroyObservable) {}

  onModuleDestroy() {
    this.moduleDestroyed$.next();
    this.moduleDestroyed$.complete();
  }
}
