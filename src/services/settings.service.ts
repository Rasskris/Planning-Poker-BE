import { FETCH_ERROR, SAVE_ERROR, UPDATE_ERROR } from '../constants';
import { Settings } from '../interfaces';
import { SettingsModel } from '../models';

export class SettingsService {
  private settings = SettingsModel;

  public async getSettings(gameId: string) {
    const settings = await this.settings.findOne({ gameId }).exec();
    
    if (settings) {
      return settings;
    }
    throw new Error(FETCH_ERROR);
  }

  public async createSettings(gameId: string) {
    const savedSettings = await this.settings.create({ gameId });

    if (savedSettings) {
      return savedSettings;
    }
    throw new Error(SAVE_ERROR);
  }

  public async updateSettings(gameId: string, settings: Settings) {
    const updatedSettings = await this.settings.findOneAndUpdate({ gameId }, settings, { new: true }).exec()

    if (updatedSettings) {
      return updatedSettings;
    }
    throw new Error(UPDATE_ERROR);
  }

  public async deleteSettings(gameId: string) {
    return this.settings.deleteMany({ gameId }).exec();
  }
}