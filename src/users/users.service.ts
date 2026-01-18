import { Injectable } from '@nestjs/common';
import { IUser } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  private readonly users: IUser[] = [];

  create(user: IUser) {
    this.users.push(user);
  }

  getAll(): IUser[] {
    return this.users;
  }

  getById(id: string): IUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  update(id: string, user: Partial<IUser>): IUser | undefined {
    const existingUser = this.getById(id);
    if (existingUser) {
      const updatedUser = { ...existingUser, ...user };
      const index = this.users.findIndex((u) => u.id === id);
      this.users[index] = updatedUser;
      return updatedUser;
    }
    return undefined;
  }

  delete(id: string): void {
    const index = this.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }
}
