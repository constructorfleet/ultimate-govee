import { Module } from '@nestjs/common';
import { GoveeConfigModule } from '../../config';
import { GoveeAPIService } from './govee-api.service';
import { GoveeProductModule } from './product/govee-product.module';

@Module({
  imports: [GoveeConfigModule, GoveeProductModule],
  controllers: [GoveeAPIService],
  providers: [],
})
export class GoveeAPIModule {}
