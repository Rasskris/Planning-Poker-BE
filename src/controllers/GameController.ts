import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { checkStartedGame, Game } from '../models';
import { DELETE_ERROR, UPDATE_ERROR } from '../constants';
import { checkExistGame } from '../utils';
import { emitGameStatus } from '../socket';
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
      .get(`${this.path}/:id`, this.getGame)
      .put(`${this.path}/:id`, this.updateGameStatus)
      .delete(`${this.path}/:id`, this.deleteGame);
  }

  private getGame = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const games = await this.game.find({}).exec();
      const isExistGame = checkExistGame(games, id);

      res.send({ isExistGame });
    } catch(err) {
      next(err);
    }
  }

  private updateGameStatus = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: gameId } = req.params;
      const { currentUserId, isStarted } = req.body;
      const updatedGame = await this.game.findOneAndUpdate({ _id: gameId }, isStarted, { new: true });

      if (!updatedGame) {
        throw new Error(UPDATE_ERROR);
      }

      emitGameStatus(currentUserId, gameId, isStarted );
      res.send({ status: isStarted });
    } catch (err) {
      next(err);
    }
  }

  private deleteGame = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deletedGame = await this.game.findByIdAndDelete(id);

      if (!deletedGame) {
        throw new Error(DELETE_ERROR);
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