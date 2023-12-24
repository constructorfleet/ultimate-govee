import { Global, Module } from '@nestjs/common';
import { GoveeConfiguration } from './govee.config';

@Global()
@Module({
  imports: [],
  providers: [GoveeConfiguration],
  exports: [GoveeConfiguration],
})
export class GoveeConfigModule {}
