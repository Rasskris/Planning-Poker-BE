import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { Message } from '../models';
import { emitMessage } from '../socket';
import { FETCH_ERROR, SAVE_ERROR } from '../constants';

class MessageController implements Controller {
  public path = '/messages';
  public router = Router();
  private message = Message;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:gameId`, this.getMessages);
    this.router.post(this.path, this.addMessage);
  }

  private getMessages = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const messages = await this.message.find({ gameId }).exec();

      if (!messages) {
        throw new Error(FETCH_ERROR);
      }
      res.send(messages);
    } catch(err) {
      next(err);
    }
  };

  private addMessage = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const message = new this.message({ ...req.body });
      const savedMessage = await message.save();
      const { sender, gameId } = savedMessage;

      if (!savedMessage) {
        throw new Error(SAVE_ERROR);
      }
      emitMessage(sender.id, gameId, savedMessage);
      res.send(savedMessage);
    } catch (err) {
      next(err);
    }
  };
}

export { MessageController };
