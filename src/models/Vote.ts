import mongoose from 'mongoose';
import { Vote } from '../interfaces';

const VoteSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
  },
  countUsersWithoutVictim: {
    type: Number,
    required: true,
  },
  countVotesForKick: {
    type: Number,
    default: 0,
  },
  countVotesAgainstKick: {
    type: Number,
    default: 0,
  },
  victimId: {
    type: String,
    required: true,
  }
});

export const VoteModel = mongoose.model<Vote>('Vote', VoteSchema);

