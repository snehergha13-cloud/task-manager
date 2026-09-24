import { User } from './entities/user.entity';

export function toUserResponse(user: User): Omit<User, 'password'> {
  const { password, ...rest } = user;
  return rest;
}
