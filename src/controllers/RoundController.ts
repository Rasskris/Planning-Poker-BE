import { Request, Response, NextFunction, Router } from 'express';
import { Controller, Timer } from '../interfaces';
import { FETCH_ERROR, UPDATE_ERROR, ROUND_STATUS } from '../constants';
import { findGameSettingsByGameId, resetSelectedCard, Round  } from '../models';
import { emitResetSelectedCard, emitUpdateRound } from '../socket';
import { SocketTimer } from '../utils';

type Timers = {
  [key: string]: SocketTimer;
}

class RoundController implements Controller {
  public path = '/round';
  public router = Router();
  private round = Round;
  private timers: Timers;

  constructor() {
    this.initializeRoutes();
    this.timers = {};
  }

  private initializeRoutes() {
    this.router
      .get(`${this.path}/:gameId`, this.getRoundStatus)
      .get(`${this.path}/timer/:gameId`, this.stopTimer)
      .put(`${this.path}/:gameId`, this.updateRoundStatus);
  }

  private startTimer = ({ minutes, seconds, ioServer, gameId }: Timer) =>  {
    this.timers[gameId] = new SocketTimer({ minutes, seconds, ioServer, gameId });
    this.timers[gameId].startCountdown();
  }

  private stopTimer = (req: Request, res: Response, next: NextFunction) => {
    const { gameId } = req.params;
    this.timers[gameId].clearTimer();
  }

  private getRoundStatus = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const round = await this.round.findOne({ gameId }).exec();

      if(!round) {
          throw new Error(FETCH_ERROR);
      }

      const { roundStatus } = round;
      res.send({ status: roundStatus });
    } catch(err) {
      next(err);
    }
  }

  private updateRoundStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const { roundStatus, userId } = req.body;
      const updatedRound = await this.round.updateOne({ gameId }, { roundStatus }, { new: true, upsert: true }).exec();
      const currentGameSettings = await findGameSettingsByGameId(gameId);

      if (!updatedRound) {
        throw new Error(UPDATE_ERROR);
      }
      if (!currentGameSettings) {
        throw new Error(FETCH_ERROR);
      }

      emitUpdateRound(gameId, userId, roundStatus);
      res.send({ status: roundStatus });
      
      if (roundStatus === ROUND_STATUS.STARTED) {
        const { timerValuesSetting, scoreTypeShortSetting } = currentGameSettings;
        const { minutes, seconds } = timerValuesSetting;
        const ioServer = req.app.get('socketio');

        await resetSelectedCard(gameId, scoreTypeShortSetting);
        emitResetSelectedCard(gameId, userId, scoreTypeShortSetting);

        this.startTimer({ minutes, seconds, ioServer, gameId });
      }
    } catch (err) {
      next(err);
    }
  }
}

export { RoundController };