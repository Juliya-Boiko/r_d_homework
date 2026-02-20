import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { OrderItem } from '../../orders/order-item.entity';
import { Product } from '../../products/product.entity';
import type { GraphQLContext } from '../loaders/loaders.types';
import { ProductsService } from '../../products/products.service';

@Resolver(() => OrderItem)
export class OrderItemResolver {
  constructor(
    private readonly productsService: ProductsService, // Замість репозиторію
  ) { }

  @ResolveField(() => Product, { nullable: true })
  async product(
    @Parent() orderItem: OrderItem,
    @Context() ctx: GraphQLContext,
  ): Promise<Product | null> {
    if (ctx.strategy === 'naive') {
      // Делегуємо пошук сервісу продуктів
      return this.productsService.findById(orderItem.productId);
      // return this.productsRepository.findOne({ where: { id: orderItem.productId } });
    }

    // DataLoader залишається без змін
    return ctx.loaders.productByIdLoader.load(orderItem.productId);
  }
}
