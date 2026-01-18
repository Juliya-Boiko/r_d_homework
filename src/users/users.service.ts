import { Injectable } from '@nestjs/common';
import { IUser } from './interfaces/user.interface';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly users: IUser[] = [];

  create(dto: CreateUserDto) {
    const id = randomUUID();

    const newUser: IUser = {
      id,
      name: dto.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      email: dto.email,
    };
    this.users.push(newUser);
    return newUser;
  }

  getAll(): IUser[] {
    return this.users;
  }

  getById(id: string): IUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  update(id: string, user: UpdateUserDto): IUser | undefined {
    const existingUser = this.getById(id);
    if (!existingUser) return undefined;
    const updatedUser = { ...existingUser, ...user };
    const index = this.users.findIndex((u) => u.id === id);
    this.users[index] = updatedUser;
    return updatedUser;
  }

  delete(id: string): void {
    const index = this.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }
}
