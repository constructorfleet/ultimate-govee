import { Module, OnModuleDestroy } from '@nestjs/common';
import { RGBLightFactory } from './rgb-light';
import { ModuleDestroyObservable } from '@govee/common';

@Module({
  providers: [RGBLightFactory, ModuleDestroyObservable],
  exports: [RGBLightFactory],
})
export class RGBLightModule implements OnModuleDestroy {
  constructor(private readonly moduleDestroyed$: ModuleDestroyObservable) {}

  onModuleDestroy() {
    this.moduleDestroyed$.next();
    this.moduleDestroyed$.complete();
  }
}
