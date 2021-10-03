import { User } from '../interfaces';
import { userRoles } from '../constants';

export const getPercentVotedForKick = (countUsers: number, countVotesFor: number) => {
  const percentVotedForKick = (countVotesFor / countUsers) * 100;
  
  return percentVotedForKick;
};
