import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Between,
  MoreThanOrEqual,
  FindOptionsWhere,
  In,
  Repository,
  LessThanOrEqual,
} from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { OrdersFilterInput, OrdersPaginationInput } from './dto/resolvers.inputs';
import { OrdersConnection } from './dto/orders-connection.type';

export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderInput = {
  userId: string;
  items: CreateOrderItemInput[];
  idempotencyKey?: string;
};

export type ListOrdersInput = {
  userId?: string;
  status?: OrderStatus;
  from?: Date;
  to?: Date;
  limit: number;
  offset: number;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) { }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    if (!input.userId || input.items.length === 0) {
      throw new BadRequestException('userId and items are required');
    }

    // Перевірка користувача
    const user = await this.usersRepository.findOne({ where: { id: input.userId } });
    if (!user) throw new NotFoundException(`User with id "${input.userId}" not found`);

    // Ідемпотентність: якщо ключ вже існує, повертаємо існуюче замовлення
    if (input.idempotencyKey) {
      const existingOrder = await this.ordersRepository.findOne({
        where: { idempotencyKey: input.idempotencyKey },
        relations: { user: true, items: { product: true } },
      });
      if (existingOrder) return existingOrder;
    }

    // Унікальні productId та отримання продуктів
    const productIds = [...new Set(input.items.map((item) => item.productId))];
    const products = await this.productsRepository.find({
      where: { id: In(productIds) },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products were not found');
    }

    const productsById = new Map(products.map((p) => [p.id, p]));

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Блокування продуктів для уникнення race condition
      const lockedProducts = await queryRunner.manager
        .getRepository(Product)
        .createQueryBuilder('product')
        .where('product.id IN (:...ids)', { ids: productIds })
        .setLock('pessimistic_write')
        .getMany();

      const lockedById = new Map(lockedProducts.map((p) => [p.id, p]));

      // Перевірка stock
      for (const item of input.items) {
        const product = lockedById.get(item.productId);
        if (!product) throw new NotFoundException(`Product with id "${item.productId}" not found`);
        if (item.quantity <= 0) throw new BadRequestException('Quantity must be greater than zero');
        if (product.stock < item.quantity)
          throw new ConflictException(`Insufficient stock for product "${product.id}"`);
      }

      // Оновлення stock
      for (const item of input.items) {
        const product = lockedById.get(item.productId)!;
        product.stock -= item.quantity;
      }
      await queryRunner.manager.getRepository(Product).save([...lockedById.values()]);

      // Створення order
      const order = queryRunner.manager.getRepository(Order).create({
        userId: user.id,
        user,
        status: OrderStatus.CREATED,
        idempotencyKey: input.idempotencyKey ?? null,
      });
      await queryRunner.manager.getRepository(Order).save(order);

      // Створення order items
      const orderItems = input.items.map((item) => {
        const product = productsById.get(item.productId)!;
        return queryRunner.manager.getRepository(OrderItem).create({
          orderId: order.id,
          order,
          productId: product.id,
          product,
          quantity: item.quantity,
          priceSnapshot: product.price,
        });
      });
      await queryRunner.manager.getRepository(OrderItem).save(orderItems);

      await queryRunner.commitTransaction();

      const createdOrder = await queryRunner.manager.getRepository(Order).findOne({
        where: { id: order.id },
        relations: { user: true, items: { product: true } },
      });
      return createdOrder!;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();

      // 23505 idempotencyKey handling
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.code === '23505' && input.idempotencyKey) {
        const existing = await this.ordersRepository.findOne({
          where: { idempotencyKey: input.idempotencyKey },
          relations: { user: true, items: { product: true } },
        });
        if (existing) return existing;
      }

      if (error instanceof HttpException) {
        throw error; // 400 / 404 / 409
      }

      throw new InternalServerErrorException('Failed to create order');
    } finally {
      await queryRunner.release();
    }
  }

  async listOrders(input: ListOrdersInput): Promise<Order[]> {
    const qb = this.ordersRepository
      .createQueryBuilder('orders')
      .leftJoinAndSelect('orders.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('orders.user', 'user')
      .orderBy('orders.createdAt', 'DESC')
      .take(input.limit)
      .skip(input.offset);

    if (input.userId) {
      qb.andWhere('orders.userId = :userId', { userId: input.userId });
    }

    if (input.status) {
      qb.andWhere('orders.status = :status', { status: input.status });
    }

    if (input.from) {
      qb.andWhere('orders.createdAt >= :from', { from: input.from });
    }

    if (input.to) {
      qb.andWhere('orders.createdAt <= :to', { to: input.to });
    }

    try {
      return qb.getMany();
    } catch (error) {
      console.error('DB error in listOrders:', error);
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }

  async findAllPaginated(
    filter?: OrdersFilterInput,
    pagination: OrdersPaginationInput = { offset: 0, limit: 10 },
  ): Promise<OrdersConnection> {
    const where: FindOptionsWhere<Order> = {};

    if (filter?.status) {
      where.status = filter.status;
    }

    // Логіка фільтрації по датах
    if (filter?.dateFrom && filter?.dateTo) {
      where.createdAt = Between(filter.dateFrom, filter.dateTo);
    } else if (filter?.dateFrom) {
      where.createdAt = MoreThanOrEqual(filter.dateFrom);
    } else if (filter?.dateTo) {
      where.createdAt = LessThanOrEqual(filter.dateTo);
    }

    try {
      const [data, totalCount] = await this.ordersRepository.findAndCount({
        where,
        relations: { items: { product: true } },
        order: { createdAt: 'DESC' },
        take: pagination.limit,
        skip: pagination.offset,
      });

      return { data, totalCount };
    } catch (error) {
      console.error('DB error in findAllPaginated:', error);
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }
}
