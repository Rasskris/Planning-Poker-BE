import mongoose from 'mongoose';
import { ROUND_STATUS } from '../constants';
import { Round } from '../interfaces';

const RoundSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
  },
  roundStatus: {
    type: String,
    default: ROUND_STATUS.NOT_STARTED,
  },
});

const Round = mongoose.model<Round>('Round', RoundSchema);

const createRound = (gameId: string) => {
  return new Round({ gameId }).save();
};

const deleteRoundByGameId = (gameId: string) => {
  return Round.deleteOne({ gameId }).exec();
};

export { Round, createRound, deleteRoundByGameId };