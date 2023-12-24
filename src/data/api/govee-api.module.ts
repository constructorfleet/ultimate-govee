import { Module } from '@nestjs/common';
import { GoveeAPIService } from './govee-api.service';
import { GoveeProductModule } from './product/govee-product.module';
import { GoveeConfigModule } from 'src/config/govee-config..module';

@Module({
  imports: [GoveeConfigModule, GoveeProductModule],
  controllers: [GoveeAPIService],
  providers: [],
})
export class GoveeAPIModule {}
