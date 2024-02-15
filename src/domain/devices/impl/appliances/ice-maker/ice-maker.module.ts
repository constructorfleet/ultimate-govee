import { Module, OnModuleDestroy } from '@nestjs/common';
import { IceMakerFactory } from './ice-maker';
import { ModuleDestroyObservable } from '@govee/common/observables/module-destroy.observable';

@Module({
  providers: [IceMakerFactory, ModuleDestroyObservable],
  exports: [IceMakerFactory],
})
export class IceMakerModule implements OnModuleDestroy {
  constructor(private readonly moduleDestroyed$: ModuleDestroyObservable) {}

  onModuleDestroy() {
    this.moduleDestroyed$.next();
    this.moduleDestroyed$.complete();
  }
}
