import { Module, OnModuleDestroy } from '@nestjs/common';
import { AirQualityFactory } from './air-quality';
import { ModuleDestroyObservable } from '@govee/common';

@Module({
  providers: [AirQualityFactory, ModuleDestroyObservable],
  exports: [AirQualityFactory],
})
export class AirQualityModule implements OnModuleDestroy {
  constructor(private readonly moduleDestroyed$: ModuleDestroyObservable) {}

  onModuleDestroy() {
    this.moduleDestroyed$.next();
    this.moduleDestroyed$.complete();
  }
}
