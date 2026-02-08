import { UserRole } from '../../common/enums/user-role.enum';

export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
