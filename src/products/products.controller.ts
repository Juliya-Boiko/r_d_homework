import {
  Controller,
  Get,
  Post,
  // Query,
  Body,
  Param,
  // Patch,
  // Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) { }

  @Get()
  getAll(): Promise<Product[]> {
    const products = this.productsService.findAll();
    return products;
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<Product | null> {
    return this.productsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() dto: UpdateUserDto): IUser | undefined {
  //   // return this.usersService.update(id, dto);
  // }

  // @Delete(':id')
  // delete(@Param('id') id: string): void {
  //   // this.usersService.delete(id);
  // }
}
