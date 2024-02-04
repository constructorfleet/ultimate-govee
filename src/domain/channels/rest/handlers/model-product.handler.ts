import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GoveeProductService, Product } from '@govee/data';
import { ModelProductQuery } from '../queries';

const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

@QueryHandler(ModelProductQuery)
export class ModelProductQueryHandler
  implements IQueryHandler<ModelProductQuery>
{
  private lastUpdated: number = 0;
  private productMap: Record<string, Product> = {};

  constructor(private readonly api: GoveeProductService) {}

  async execute(query: ModelProductQuery): Promise<any> {
    if (Date.now() - this.lastUpdated > REFRESH_INTERVAL) {
      this.productMap = await this.api.getProductCategories();
    }

    return this.productMap[query.device.model];
  }
}
