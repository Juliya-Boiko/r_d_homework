import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) { }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(dto);
    try {
      return await this.productsRepository.save(product);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (err.code === '23505') {
        throw new BadRequestException(`Product with title "${dto.title}" already exists`);
      }
      throw err;
    }
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.productsRepository.find({ where: { id: In(ids) } });
  }

  async findById(id: string): Promise<Product | null> {
    return this.productsRepository.findOneBy({ id });
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }
}
