import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
    }),
    UsersModule,
  ],
})
export class AppModule implements NestModule, OnModuleInit, OnModuleDestroy {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }

  onModuleInit() {
    console.log('🟢 AppModule initialized');
  }

  onModuleDestroy() {
    console.log('🔴 AppModule destroyed');
  }
}
