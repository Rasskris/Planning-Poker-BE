import mongoose from 'mongoose';
import { Issue } from '../interfaces';

const IssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    required: true,
  },
  creatorId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameId: {
    type: String,
    required: true,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
  isDone: {
    type: Boolean,
    default: false,
  },
  statistics: {
    type: Array,
  }
});

export const IssueModel = mongoose.model<Issue>('Issue', IssueSchema);
