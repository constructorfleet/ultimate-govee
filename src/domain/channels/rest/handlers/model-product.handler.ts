import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GoveeProductService, Product } from '@govee/data';
import { ModelProductQuery } from '../queries';

const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

@QueryHandler(ModelProductQuery)
export class ModelProductQueryHandler
  implements IQueryHandler<ModelProductQuery, Product | undefined>
{
  private lastUpdated: number = 0;
  private productMap: Record<string, Product> = {};

  constructor(private readonly api: GoveeProductService) {}

  async execute(query: ModelProductQuery): Promise<Product | undefined> {
    if (Date.now() - this.lastUpdated > REFRESH_INTERVAL) {
      return this.api.getProductCategories().then((productMap) => {
        this.productMap = productMap;
        return productMap[query.device.model];
      });
    }

    return Promise.resolve(this.productMap[query.device.model]);
  }
}
