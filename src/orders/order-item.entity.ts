import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

// User
//  └─ Order
//      └─ OrderItem
//          └─ Product

@ObjectType()
@Entity('order_items') // клас відповідає таблиці order_items у PostgreSQL
@Index('IDX_order_items_order_id', ['orderId']) // індекс для швидких запитів типу find({ where: { orderId } })
@Index('IDX_order_items_product_id', ['productId']) // індекс для швидких запитів типу find({ where: { productId } })
export class OrderItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' }) // зв'язок "багато-до-одного" з Order, при видаленні замовлення видаляються всі його позиції
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Field(() => ID)
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Field(() => Product)
  @ManyToOne(() => Product, (product) => product.orderItems, { onDelete: 'RESTRICT' }) // зв'язок "багато-до-одного" з Product, при видаленні продукту буде помилка, якщо він використовується в замовленнях
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Field(() => Int)
  @Column({ type: 'int' })
  quantity: number;

  @Field(() => String)
  @Column('numeric', { precision: 12, scale: 2, name: 'price_snapshot' })
  priceSnapshot: string; // зберігає ціну продукту на момент замовлення, щоб історія замовлень залишалася коректною навіть при зміні цін на продукти
}
