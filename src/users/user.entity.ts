import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from '../orders/order.entity';
import { UserRole } from 'src/common/enums/user-role.enum';

@Entity('users') // клас відповідає таблиці users у PostgreSQL
@Index('IDX_users_email_unique', ['email'], { unique: true }) // унікальний індекс на email
export class User {
  @PrimaryGeneratedColumn('uuid') // первинний ключ, автоматично генерується UUID
  id: string;

  @Column({ type: 'varchar', length: 320 })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'users_role_enum',
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[]; // зв'язок "один юзер-до-багатьох замовлень"

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
