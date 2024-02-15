import { Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigurableModuleClass } from './ble.types';
import { BleClient } from './ble.client';
import { DecoderModule } from './decoder/decoder.module';
import { ModuleDestroyObservable } from '@govee/common';
@Module({
  imports: [DecoderModule],
  providers: [BleClient, ModuleDestroyObservable],
  exports: [BleClient],
})
export class BleModule
  extends ConfigurableModuleClass
  implements OnModuleDestroy
{
  constructor(private readonly moduleDestroyed$: ModuleDestroyObservable) {
    super();
  }

  onModuleDestroy() {
    this.moduleDestroyed$.next();
    this.moduleDestroyed$.complete();
  }
}
