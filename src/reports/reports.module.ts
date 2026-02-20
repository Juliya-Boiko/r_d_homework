import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { ReportsController } from './reports.controller';
import { ReportsRawController } from './reports-raw.controller';
import { ReportsRawService } from './reports-raw.service';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [ReportsController, ReportsRawController],
  providers: [ReportsService, ReportsRawService],
})
export class ReportsModule { }
