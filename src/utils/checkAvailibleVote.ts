import { User } from '../interfaces';
import { userRoles } from '../constants';

export const checkAvailibleVote = (users: User[]) => {
  const countUsers = users.filter((user) => user.role !== userRoles.dealer);

  return countUsers.length >= 3;
};
