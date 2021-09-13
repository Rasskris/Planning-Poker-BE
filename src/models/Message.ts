import mongoose from 'mongoose';
import { Message } from '../interfaces';

const MessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    minlength: 1,
  },
  sender: {
    id: String,
    firstName: String,
    lastName: String,
    role: String,
    gameId: String,
  },
  gameId: {
    type: String,
    required: true,
  },
});

const Message = mongoose.model<Message>('Message', MessageSchema);

const deleteMessagesByGameId = (gameId: string) => {
  return Message.deleteMany({ gameId }).exec();
};

export { Message, deleteMessagesByGameId };
