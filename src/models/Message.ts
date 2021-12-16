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

export const MessageModel = mongoose.model<Message>('Message', MessageSchema);

