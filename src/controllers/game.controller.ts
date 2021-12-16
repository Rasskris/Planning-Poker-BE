import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { GameService } from '../services';
import { emitGameStatus } from '../socket';

class GameController implements Controller {
  public path = '/games';
  public router = Router();

  constructor(
    private gameService: GameService,
  ) {
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
      const { id: gameId } = req.params;
      const isGameExist = await this.gameService.checkIsGameExist(gameId);

      res.send({ isGameExist });
    } catch(err) {
      next(err);
    }
  }

  private updateGameStatus = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: gameId } = req.params;
      const { currentUserId, isStarted } = req.body;
      await this.gameService.updateGameStatus(gameId, isStarted);

      emitGameStatus(currentUserId, gameId, isStarted );
      res.send({ status: isStarted });
    } catch (err) {
      next(err);
    }
  }

  private deleteGame = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: gameId } = req.params;
      const deletedGame = await this.gameService.deleteGame(gameId);
      
      const ioServer = req.app.get('socketio');
      ioServer.to(gameId).emit('cancelGame');

      res.send(deletedGame);
    } catch (err) {
      next(err);
    }
  }
}

export { GameController };