import { GoveeProductModule } from './data/api/product/govee-product.module';
import { GoveeprouctsserviceService } from './data/api/product/govee-product.service';
import { GoveeAPIModule } from './data/api/govee-api.module';
import { GoveeapiclientService } from './data/api/govee-api.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [GoveeProductModule, GoveeAPIModule],
  controllers: [AppController],
  providers: [GoveeprouctsserviceService, GoveeapiclientService, AppService],
})
export class AppModule {}
