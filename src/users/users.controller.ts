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
  create(@Body() user: IUser) {
    this.usersService.create(user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() user: Partial<IUser>,
  ): IUser | undefined {
    return this.usersService.update(id, user);
  }

  @Delete(':id')
  delete(@Param('id') id: string): void {
    this.usersService.delete(id);
  }
}
