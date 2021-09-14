import mongoose from 'mongoose';
import { Game } from '../interfaces';

//TODO add more fields

const GameSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  }
});

const Game = mongoose.model<Game>('Game', GameSchema);

const createGame = () => {
  return new Game().save();
}
export { Game, createGame };
