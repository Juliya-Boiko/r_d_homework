import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { LoadersFactory } from './loaders/loaders.factory';
import { LoadersModule } from './loaders/loaders.module';
import { HelloResolver } from './resolvers/hello.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User, Product]),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [LoadersModule],
      inject: [LoadersFactory],
      useFactory: (loadersFactory: LoadersFactory) => ({
        autoSchemaFile: true,
        path: '/graphql',
        graphiql: true,
        introspection: true,
        context: () => ({
          loaders: loadersFactory.create(),
          strategy: 'optimized' as const,
        }),
      }),
    }),
  ],
  providers: [HelloResolver],
})
export class AppGraphqlModule { }
