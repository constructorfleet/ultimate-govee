import { Module, OnModuleDestroy } from '@nestjs/common';
import { HumidifierFactory } from './humidifier';
import { ModuleDestroyObservable } from '@govee/common';

@Module({
  providers: [HumidifierFactory, ModuleDestroyObservable],
  exports: [HumidifierFactory],
})
export class HumidifierModule implements OnModuleDestroy {
  constructor(private readonly moduleDestroyed$: ModuleDestroyObservable) {}

  onModuleDestroy() {
    this.moduleDestroyed$.next();
    this.moduleDestroyed$.complete();
  }
}
