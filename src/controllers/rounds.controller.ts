import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { emitFinishRound, emitResetSelectedCard, emitStartRound } from '../socket';
import { RoundsService } from '../services';

class RoundController implements Controller {
  public path = '/round';
  public router = Router();

  constructor(
    private roundsService: RoundsService,
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .get(`${this.path}/:gameId`, this.getRoundStatus)
      .put(`${this.path}/start/:gameId`, this.startRound)
      .put(`${this.path}/finish/:gameId`, this.finishRound);
  }

  private getRoundStatus = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const roundStatus = await this.roundsService.getRoundStatus(gameId);

      res.send({ roundStatus });
    } catch(err) {
      next(err);
    }
  }

  private startRound = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ioServer = req.app.get('socketio');
      const { gameId } = req.params;
      const { userId } = req.body;
      const { scoreTypeShort, roundStatus } = await this.roundsService.startRound(gameId, ioServer);

      emitStartRound(gameId, userId);
      emitResetSelectedCard(gameId, userId, scoreTypeShort);

      res.send({ roundStatus });
    } catch (err) {
      next(err);
    }
  }

  private finishRound = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const { roundStatus } = await this.roundsService.finishRound(gameId);

      res.send({ roundStatus });
    } catch (err) {
      next(err);
    }
  }
}

export { RoundController };