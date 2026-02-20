import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/user.entity';
import { Product } from '../../products/product.entity';
import { LoadersFactory } from './loaders.factory';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product])],
  providers: [LoadersFactory],
  exports: [LoadersFactory],
})
export class LoadersModule { }
