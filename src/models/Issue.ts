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
  isDone: {
    type: Boolean,
    default: false,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
  statistics: {
    type: Array,
  }
});

const Issue = mongoose.model<Issue>('Issue', IssueSchema);

const deleteIssueByGameId = (gameId: string) => {
  return Issue.deleteOne({ gameId }).exec();
};

const deleteIssuesByGameId = (gameId: string) => {
  return Issue.deleteMany({ gameId }).exec();
};

export { Issue, deleteIssueByGameId, deleteIssuesByGameId };
