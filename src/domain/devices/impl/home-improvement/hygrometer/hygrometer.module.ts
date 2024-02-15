import { Module, OnModuleDestroy } from '@nestjs/common';
import { HygrometerFactory } from './hygrometer';
import { ModuleDestroyObservable } from '@govee/common';

@Module({
  providers: [HygrometerFactory, ModuleDestroyObservable],
  exports: [HygrometerFactory],
})
export class HygrometerModule implements OnModuleDestroy {
  constructor(private readonly moduleDestroyed$: ModuleDestroyObservable) {}

  onModuleDestroy() {
    this.moduleDestroyed$.next();
    this.moduleDestroyed$.complete();
  }
}
