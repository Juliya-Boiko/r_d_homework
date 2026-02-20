import { OrdersService } from '../../orders/orders.service';
import { Order } from '../../orders/order.entity';
import { OrdersConnection } from '../../orders/dto/orders-connection.type';
import { OrdersFilterInput, OrdersPaginationInput } from '../../orders/dto/resolvers.inputs';
import { Resolver, Query, ResolveField, Parent, Context, Args } from '@nestjs/graphql';
import type { GraphQLContext } from '../loaders/loaders.types';
import { User } from '../../users/user.entity';
import { UsersService } from '../../users/users.service';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) { }

  @Query(() => OrdersConnection, { name: 'orders' })
  async getOrders(
    @Context() ctx: GraphQLContext,
    @Args('filter', { type: () => OrdersFilterInput, nullable: true })
    filter: OrdersFilterInput,

    @Args('pagination', { type: () => OrdersPaginationInput, nullable: true })
    pagination: OrdersPaginationInput,
  ): Promise<OrdersConnection> {
    ctx.strategy = 'optimized';
    const limit = pagination?.limit ?? 10;
    const offset = pagination?.offset ?? 0;

    console.log(`📊 Applying filters:`, filter);
    console.log('📊 Raw pagination arg:', pagination);

    return this.ordersService.findAllPaginated(filter, { limit, offset });
  }

  @Query(() => [Order])
  ordersNaive(@Context() ctx: GraphQLContext): Promise<Order[]> {
    ctx.strategy = 'naive';

    return this.ordersService.listOrders({
      limit: 100,
      offset: 0,
    });
  }

  @ResolveField(() => User, { nullable: true })
  async customer(@Parent() order: Order, @Context() ctx: GraphQLContext): Promise<User | null> {
    if (ctx.strategy === 'naive') {
      return this.usersService.findById(order.userId);
    }

    return ctx.loaders.userByIdLoader.load(order.customerId);
  }
}
