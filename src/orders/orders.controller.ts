import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from 'src/common/enums/order-status.enum';

type CreateOrderBody = {
  userId: string;
  items: { productId: string; quantity: number }[];
  idempotencyKey?: string;
};

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() body: CreateOrderBody) {
    if (!body?.userId || !Array.isArray(body.items)) {
      throw new BadRequestException('userId and items are required');
    }

    return this.ordersService.createOrder({
      userId: body.userId,
      items: body.items,
      idempotencyKey: body.idempotencyKey,
    });
  }

  @Get()
  async listOrders(
    @Query('userId') userId?: string,
    @Query('status') status?: OrderStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = Number(limit ?? 20);
    const parsedOffset = Number(offset ?? 0);
    const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;
    const safeOffset = Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    if (fromDate && Number.isNaN(fromDate.getTime())) {
      throw new BadRequestException('from must be valid date');
    }

    if (toDate && Number.isNaN(toDate.getTime())) {
      throw new BadRequestException('to must be valid date');
    }

    return this.ordersService.listOrders({
      userId,
      status,
      from: fromDate,
      to: toDate,
      limit: safeLimit,
      offset: safeOffset,
    });
  }
}
