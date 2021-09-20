import { User,Game } from './interfaces';
import { userRoles } from './constants';

export const checkAvailibleVote = (users: User[]) => {
  const countUsers = users.filter((user) => user.role !== userRoles.dealer);

  return countUsers.length >= 3;
};

export const getPercentVotedForKick = (countUsers: number, countVotesFor: number) => {
  const percentVotedForKick = (countVotesFor / countUsers) * 100;
  
  return percentVotedForKick;
};

export const checkExistGame = (games: Game[], gameId: string) => {
  const existGame = games.find((game) => game.id === gameId);
  return existGame ? true : false;
};