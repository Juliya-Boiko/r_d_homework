import {
  Controller,
  Get,
  Post,
  // Query,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
// import { CreateCatDto } from './dto/create-cat.dto';
import { UsersService } from './users.service';
import type { IUser } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get()
  getAll(): IUser[] {
    return this.usersService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string): IUser | undefined {
    return this.usersService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto): IUser {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto): IUser | undefined {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string): void {
    this.usersService.delete(id);
  }
}
