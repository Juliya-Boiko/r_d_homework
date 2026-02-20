import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { TopProductItem, TopProductsQuery, TopProductsResponse } from './dto/top-products.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) { }

  async getTopProducts(query: TopProductsQuery): Promise<TopProductsResponse> {
    const rows = await this.ordersRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.items', 'items')
      .innerJoin('items.product', 'product')
      .where('orders.createdAt >= :from', { from: query.from })
      .andWhere('orders.createdAt <= :to', { to: query.to })
      .select('product.id', 'productId')
      .addSelect('product.title', 'title')
      .addSelect('SUM(items.quantity)', 'soldQty')
      .addSelect('SUM(items.quantity * items.priceAtPurchase)', 'revenue')
      .groupBy('product.id')
      .addGroupBy('product.title')
      .orderBy('revenue', 'DESC')
      .limit(query.limit)
      .getRawMany<{
        productId: string;
        title: string;
        soldQty: string;
        revenue: string;
      }>();

    const items: TopProductItem[] = rows.map((row) => ({
      productId: row.productId,
      title: row.title,
      soldQty: Number(row.soldQty),
      revenue: row.revenue,
    }));

    return {
      from: query.fromLabel,
      to: query.toLabel,
      limit: query.limit,
      items,
    };
  }
}
