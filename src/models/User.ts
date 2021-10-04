import mongoose from 'mongoose';
import { userRoles } from '../constants';
import { User } from '../interfaces';

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  jobPosition: {
    type: String,
  },
  avatar: {
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
  selectedCard: {
    scoreType: String,
    scoreValue: String,
  }
});

const User  = mongoose.model<User>('User', UserSchema);

const deleteUsersByGameId = (gameId: string) => {
  return User.deleteMany({ gameId }).exec();
};

const findUserById = (userId: string) => {
  return User.findById(userId).exec();
};

const findUsersByGameId = (gameId: string) => {
  return User.find({ gameId }).exec();
};

const deleteUserById = (id: string) => {
  return User.findOneAndDelete({ _id: id }).exec();
};

const findDealerByGameId = (gameId: string) => {
  return User.findOne({ gameId, role: userRoles.dealer }).exec();
};

export { User, deleteUsersByGameId, findUserById, deleteUserById, findUsersByGameId, findDealerByGameId };
