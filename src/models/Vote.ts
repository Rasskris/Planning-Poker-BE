import mongoose from 'mongoose';
import { Vote } from '../interfaces';

const VoteSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
  },
  countUsers: {
    type: Number,
    required: true,
  },
  countVotesFor: {
    type: Number,
  },
  victimId: {
    type: String,
    required: true,
  }
});

const Vote = mongoose.model<Vote>('Vote', VoteSchema);

export { Vote };
