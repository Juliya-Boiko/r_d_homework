import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Order } from '../order.entity';

@ObjectType()
export class OrdersConnection {
  @Field(() => [Order])
  data: Order[];

  @Field(() => Int)
  totalCount: number;
}
