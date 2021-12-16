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

export const RoundModel = mongoose.model<Round>('Round', RoundSchema);
