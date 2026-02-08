import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const host = configService.getOrThrow<string>('DB_HOST');
        const port = Number(configService.getOrThrow<string>('DB_PORT'));
        const username = configService.getOrThrow<string>('DB_USER');
        const password = configService.getOrThrow<string>('DB_PASSWORD');
        const database = configService.getOrThrow<string>('DB_NAME');

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    UsersModule,
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule implements NestModule, OnModuleInit, OnModuleDestroy {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }

  onModuleInit(): void {
    console.log('🟢 AppModule initialized');
    const configService = new ConfigService();
    console.log(
      'DB:',
      configService.get('DB_HOST'),
      configService.get('DB_USER'),
      configService.get('DB_NAME'),
    );
  }

  onModuleDestroy(): void {
    console.log('🔴 AppModule destroyed');
  }
}
