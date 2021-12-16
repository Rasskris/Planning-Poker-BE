import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { emitMessage } from '../socket';
import { MessageService } from '../services';

class MessageController implements Controller {
  public path = '/messages';
  public router = Router();

  constructor(
    private messageService: MessageService,
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:gameId`, this.getMessages);
    this.router.post(this.path, this.addMessage);
  }

  private getMessages = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const messages = await this.messageService.getMessages(gameId);

      res.send(messages);
    } catch(err) {
      next(err);
    }
  };

  private addMessage = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const savedMessage = await this.messageService.addMessage(req.body);
      const { sender, gameId } = savedMessage;

      emitMessage(sender.id, gameId, savedMessage);
      res.send(savedMessage);
    } catch (err) {
      next(err);
    }
  };
}

export { MessageController };
