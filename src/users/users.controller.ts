// import {
//   Controller,
//   Get,
//   Post,
//   // Query,
//   Body,
//   Param,
//   // Patch,
//   // Delete,
// } from '@nestjs/common';
// // import { CreateCatDto } from './dto/create-cat.dto';
// import { UsersService } from './users.service';
// import { CreateUserDto } from './dto/create-user.dto';
// // import { UpdateUserDto } from './dto/update-user.dto';
// import { User } from './user.entity';

// @Controller('api/users')
// export class UsersController {
//   constructor(private usersService: UsersService) { }

//   @Get()
//   getAll(): Promise<User[]> {
//     return this.usersService.testGetAll();
//   }

//   @Get(':id')
//   getById(@Param('id') id: string): Promise<User | null> {
//     return this.usersService.findById(id);
//   }

//   @Post()
//   create(@Body() dto: CreateUserDto): Promise<User> {
//     return this.usersService.create(dto);
//   }

//   // @Patch(':id')
//   // update(@Param('id') id: string, @Body() dto: UpdateUserDto): IUser | undefined {
//   //   // return this.usersService.update(id, dto);
//   // }

//   // @Delete(':id')
//   // delete(@Param('id') id: string): void {
//   //   // this.usersService.delete(id);
//   // }
// }

import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
// import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAll() {
    return [];
    // return this.usersService.testGetAll();
  }
}
