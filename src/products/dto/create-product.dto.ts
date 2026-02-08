import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  price: string;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  stock?: number;
}
