import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleDestroy,
  OnModuleInit,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { TypeOrmRequestContextLogger } from './database/typeorm-logger';
import { AppGraphqlModule } from './graphql/graphql.module';
import { ReportsModule } from './reports/reports.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow<string>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USER'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        logging: ['query'],
        logger: new TypeOrmRequestContextLogger(),
      }),
    }),
    AppGraphqlModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    ReportsModule,
  ],
})
export class AppModule implements NestModule, OnModuleInit, OnModuleDestroy {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
    consumer.apply(RequestContextMiddleware).forRoutes({
      path: 'graphql',
      method: RequestMethod.ALL,
    });
  }

  onModuleInit(): void {
    console.log('🟢 AppModule initialized');
    const configService = new ConfigService();
    console.log(
      '🟢 DB_HOST:',
      configService.get('DB_HOST'),
      '🟢 DB_USER:',
      configService.get('DB_USER'),
      '🟢 DB_NAME:',
      configService.get('DB_NAME'),
    );
  }

  onModuleDestroy(): void {
    console.log('🔴 AppModule destroyed');
  }
}
