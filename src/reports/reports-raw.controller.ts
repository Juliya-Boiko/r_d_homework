import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ReportsRawService } from './reports-raw.service';
import { TopProductsResponse } from './dto/top-products.dto';

@Controller('reports-raw')
export class ReportsRawController {
  constructor(private readonly reportsService: ReportsRawService) { }

  @Get('top-products')
  async getTopProducts(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('limit') limit?: string,
  ): Promise<TopProductsResponse> {
    const { fromDate, toDate, safeLimit, fromLabel, toLabel } = this.parseQuery(from, to, limit);

    return this.reportsService.getTopProducts({
      from: fromDate,
      to: toDate,
      limit: safeLimit,
      fromLabel,
      toLabel,
    });
  }

  private parseQuery(from?: string, to?: string, limit?: string) {
    if (!from || !to) {
      throw new BadRequestException('from and to are required');
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new BadRequestException('from/to must be valid dates');
    }

    const parsedLimit = Number(limit ?? 10);
    const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;

    return {
      fromDate,
      toDate,
      safeLimit,
      fromLabel: from,
      toLabel: to,
    };
  }
}
