import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TopProductItem, TopProductsQuery, TopProductsResponse } from './dto/top-products.dto';

@Injectable()
export class ReportsRawService {
  constructor(private readonly dataSource: DataSource) { }

  async getTopProducts(query: TopProductsQuery): Promise<TopProductsResponse> {
    const sql = `
      SELECT
        p.id AS "productId",
        p.title AS "title",
        SUM(oi.quantity) AS "soldQty",
        SUM(oi.quantity * oi.price_at_purchase) AS "revenue"
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      WHERE o.created_at >= $1 AND o.created_at <= $2
      GROUP BY p.id, p.title
      ORDER BY "revenue" DESC
      LIMIT $3
    `;

    const rows = await this.dataSource.query(sql, [query.from, query.to, query.limit]);

    const items: TopProductItem[] = rows.map(
      (row: { productId: string; title: string; soldQty: string; revenue: string }) => ({
        productId: row.productId,
        title: row.title,
        soldQty: Number(row.soldQty),
        revenue: row.revenue,
      }),
    );

    return {
      from: query.fromLabel,
      to: query.toLabel,
      limit: query.limit,
      items,
    };
  }
}
