import { Module, OnModuleDestroy } from '@nestjs/common';
import { RGBICLightFactory } from '..';
import { ModuleDestroyObservable } from '@govee/common';

@Module({
  providers: [RGBICLightFactory, ModuleDestroyObservable],
  exports: [RGBICLightFactory],
})
export class RGBICLightModule implements OnModuleDestroy {
  constructor(private readonly moduleDestroyed$: ModuleDestroyObservable) {}

  onModuleDestroy() {
    this.moduleDestroyed$.next();
    this.moduleDestroyed$.complete();
  }
}
