import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrdersService } from './orders.service';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { OrdersController } from './orders.controller';
import { OrdersResolver } from '../graphql/resolvers/orders.resolver';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, User]), UsersModule],
  providers: [OrdersService, OrdersResolver],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule { }
