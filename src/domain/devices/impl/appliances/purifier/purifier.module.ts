import { Module, OnModuleDestroy } from '@nestjs/common';
import { PurifierFactory } from './purifier';
import { ModuleDestroyObservable } from '@govee/common';

@Module({
  providers: [PurifierFactory, ModuleDestroyObservable],
  exports: [PurifierFactory],
})
export class PurifierModule implements OnModuleDestroy {
  constructor(private readonly moduleDestroyed$: ModuleDestroyObservable) {}

  onModuleDestroy() {
    this.moduleDestroyed$.next();
    this.moduleDestroyed$.complete();
  }
}
