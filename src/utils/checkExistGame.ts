import { Game } from '../interfaces';

export const checkExistGame = (games: Game[], gameId: string) => {
  const existGame = games.find((game) => game.id === gameId);

  return existGame ? true : false;
};