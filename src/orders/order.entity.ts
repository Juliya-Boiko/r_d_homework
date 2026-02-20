import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
@Entity('orders') // клас відповідає таблиці orders у PostgreSQL
@Index('IDX_orders_user_id', ['userId']) // індекс для швидких запитів типу find({ where: { userId } })
@Index('IDX_orders_created_at', ['createdAt']) // індекс для швидких запитів по даті створення
@Index('IDX_orders_idempotency_key_unique', ['idempotencyKey'], { unique: true })
export class Order {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Field(() => ID)
  get customerId(): string {
    return this.userId;
  }

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' }) // при видаленні юзера видаляються всі його замовлення
  @JoinColumn({ name: 'user_id' }) // вказуємо, що колонка user_id є зовнішнім ключем до таблиці users
  user: User; // зв'язок "багато замовлень-до-одного юзера"

  @Field(() => User, { nullable: true })
  customer?: User;

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[]; // зв'язок "одне замовлення-до-багатьох позицій замовлення"

  @Field(() => OrderStatus)
  @Column({
    type: 'enum',
    enum: OrderStatus,
    enumName: 'orders_status_enum',
    default: OrderStatus.CREATED,
  })
  status: OrderStatus;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 120, name: 'idempotency_key', nullable: true })
  idempotencyKey: string | null;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
