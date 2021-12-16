import mongoose from 'mongoose';
import { User } from '../interfaces';

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  jobPosition: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  gameId: {
    type: String,
    required: true,
  },
  selectedCard: {
    scoreType: String,
    scoreValue: String,
  }
});

export const UserModel  = mongoose.model<User>('User', UserSchema);


export const findUserById = (userId: string) => {
  return UserModel.findById(userId).exec();
};
