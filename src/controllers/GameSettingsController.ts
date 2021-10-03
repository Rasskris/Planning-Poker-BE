import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { GameSettings, findGameSettingsByGameId } from '../models';
import { FETCH_ERROR, SAVE_ERROR, DELETE_ERROR, userRoles } from '../constants';
import { emitGameSettings } from '../socket';

class GameSettingsController implements Controller {
  public path = '/settings';
  public router = Router();
  private gameSettings = GameSettings;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .get(`${this.path}/:gameId`, this.getSettings)
      .put(`${this.path}/:gameId`, this.updateSettings);
    }

  private getSettings = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const gameSettings = await this.gameSettings.findOne({ gameId }).exec();

      if(!gameSettings) {
          throw new Error(FETCH_ERROR);
      }

      res.send(gameSettings);
    } catch(err) {
      next(err);
    }
  }

  private updateSettings = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const { userId, settings: gameSettingsData } = req.body;
      const updatedSettings = await this.gameSettings.findOneAndUpdate({ gameId }, gameSettingsData, { new: true }).exec();

      if(!updatedSettings) {
        throw new Error(SAVE_ERROR);
      }

      emitGameSettings(userId, gameId, updatedSettings);
      res.send(updatedSettings);
    } catch (err) {
      next(err);
    }
  }
}

export { GameSettingsController };