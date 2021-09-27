import mongoose from 'mongoose';
import { Game } from '../interfaces';

const GameSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  isStarted: {
    type: Boolean,
  }
});

const Game = mongoose.model<Game>('Game', GameSchema);

const createGame = () => {
  return new Game({ isStarted: false }).save();
};

const checkGameStarted = (id: string) => {
  return Game.exists({ _id: id, isStarted: true });
};

export { Game, createGame, checkGameStarted };
