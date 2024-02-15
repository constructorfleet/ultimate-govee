import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoveeProductService } from './govee-product.service';
import { GoveeProductConfig } from './govee-product.config';

@Module({
  imports: [ConfigModule.forFeature(GoveeProductConfig)],
  providers: [GoveeProductService],
  exports: [GoveeProductService],
})
export class GoveeProductModule {}
