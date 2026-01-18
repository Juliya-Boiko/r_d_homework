import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(RequestMiddleware).forRoutes('*');
  }

  onModuleInit() {
    console.log('🟢 AppModule initialized');
  }

  onModuleDestroy() {
    console.log('🔴 AppModule destroyed');
  }
}
