import { FETCH_ERROR, SAVE_ERROR } from '../constants';
import { Message } from '../interfaces';
import { MessageModel } from '../models';

export class MessageService {
  private message = MessageModel;

  public async getMessages(gameId: string) {
    const messages = await this.message.find({ gameId }).exec();

    if (messages) {
      return messages;
    }
    throw new Error(FETCH_ERROR);
  }

  public async addMessage(messageData: Message) {
    const savedMessage = await this.message.create(messageData);

    if (savedMessage) {
      return savedMessage;
    }
    throw new Error(SAVE_ERROR);
  }
}