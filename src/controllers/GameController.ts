import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { Game } from '../models';
import { emitLeaveMember } from '../socket';
import { ERROR_OF_DELETE } from '../constants';
import { deleteUsersByGameId, deleteIssuesByGameId, deleteMessagesByGameId } from '../models';

class GameController implements Controller {
  public path = '/games';
  public router = Router();
  private game = Game;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .delete(`${this.path}/:id`, this.deleteGame);
  }

  private deleteGame = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deletedGame = await this.game.findByIdAndDelete(id);

      if (!deletedGame) {
        throw new Error(ERROR_OF_DELETE);
      }
      await deleteUsersByGameId(id);
      await deleteMessagesByGameId(id);
      await deleteIssuesByGameId(id);

      res.send(deletedGame);
    } catch (err) {
      next(err);
    }
  }
}

export { GameController };