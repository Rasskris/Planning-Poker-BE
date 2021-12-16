import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { emitSettings } from '../socket';
import { SettingsService } from '../services';

class SettingsController implements Controller {
  public path = '/settings';
  public router = Router();

  constructor(
    private settingsService: SettingsService,
  ) {
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
      const gameSettings = await this.settingsService.getSettings(gameId);

      res.send(gameSettings);
    } catch(err) {
      next(err);
    }
  }

  private updateSettings = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const { userId, settings } = req.body;
      const updatedSettings = await this.settingsService.updateSettings(gameId, settings);

      emitSettings(userId, gameId, updatedSettings);
      res.send(updatedSettings);
    } catch (err) {
      next(err);
    }
  }
}

export { SettingsController };