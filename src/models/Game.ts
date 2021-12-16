import mongoose from 'mongoose';
import { Game } from '../interfaces';

const GameSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  isStarted: {
    type: Boolean,
    default: false,
  }
});

export const GameModel = mongoose.model<Game>('Game', GameSchema);
