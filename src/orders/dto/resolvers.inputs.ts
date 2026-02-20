import { ArgsType, Field, Int, InputType } from '@nestjs/graphql';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, IsEnum, IsDate } from 'class-validator';

@ArgsType()
export class OrdersPaginationArgs {
  @Field(() => Int, { defaultValue: 10, nullable: true })
  limit: number = 10;

  @Field(() => Int, { defaultValue: 0, nullable: true })
  offset: number = 0;
}

@InputType()
export class OrdersFilterInput {
  @Field(() => OrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  dateFrom?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  dateTo?: Date;
}

@InputType()
export class OrdersPaginationInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
