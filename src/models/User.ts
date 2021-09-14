import mongoose from 'mongoose';
import { User } from '../interfaces';

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  joPosition: {
    type: String,
  },
  image: {
    type: String,
  },
  role: {
    type: String,
    required: true,
  },
  gameId: {
    type: String,
    required: true,
  },
});

const User  = mongoose.model<User>('User', UserSchema);

const deleteUsersByGameId = (gameId: string) => {
  return User.deleteMany({ gameId }).exec();
};

const findUserById = (userId: string) => {
  return User.findById(userId).exec();
}

export { User, deleteUsersByGameId, findUserById };