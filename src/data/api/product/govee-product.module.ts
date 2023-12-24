import { Module } from '@nestjs/common';
import { GoveeProductService } from './govee-product.service';
import { GoveeProductConfiguration } from './govee-product.config';
import { GoveeConfigModule } from 'src/config/govee-config..module';

@Module({
  imports: [GoveeConfigModule],
  providers: [GoveeProductConfiguration, GoveeProductService],
  exports: [GoveeProductService],
})
export class GoveeProductModule {}
