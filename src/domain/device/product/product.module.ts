import { Module } from '@nestjs/common';
import { GoveeProductModule } from '../../../data';
import { ProductStore } from './product.store';
import { ProductService } from './product.service';

@Module({
  imports: [GoveeProductModule],
  providers: [ProductStore, ProductService],
  exports: [ProductService],
})
export class ProductModule {}
