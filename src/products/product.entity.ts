import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from '../orders/order-item.entity';
import { ObjectType, Field, ID, Int, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
@Entity('products') // клас відповідає таблиці products у PostgreSQL
@Index('IDX_products_title_unique', ['title'], { unique: true })
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid') // первинний ключ, автоматично генерується UUID
  id: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Field(() => String)
  @Column('numeric', { precision: 12, scale: 2 })
  price: string;

  @Field(() => Boolean)
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  stock: number;

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[]; // зв'язок "один продукт-до-багатьох позицій замовлення"

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
