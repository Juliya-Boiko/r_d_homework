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

@Entity('products') // клас відповідає таблиці products у PostgreSQL
@Index('IDX_products_title_unique', ['title'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn('uuid') // первинний ключ, автоматично генерується UUID
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column('numeric', { precision: 12, scale: 2 })
  price: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[]; // зв'язок "один продукт-до-багатьох позицій замовлення"

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
