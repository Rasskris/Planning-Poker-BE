import { NextFunction } from 'express';
import { DELETE_ERROR, SAVE_ERROR, UPDATE_ERROR } from '../constants';
import { GameNotFoundException } from '../exceptions';
import { GameModel, IssueModel, MessageModel, RoundModel, SettingsModel, UserModel } from '../models';

export class GameService {
  private game = GameModel;
  private message = MessageModel;
  private issue = IssueModel;
  private user = UserModel;
  private settings = SettingsModel;
  private round = RoundModel;

  public async createGame() {
    const game = new this.game();
    const savedGame  = await game.save();

    if (savedGame) {
      const gameId = savedGame.id;
      await this.settings.create({ gameId });
      await this.round.create({ gameId });

      return game;
    }
    throw new Error(SAVE_ERROR);
  }

  public async checkIsGameExist(gameId: string) {
    try {
      const isGameExist = await this.game.exists({ _id: gameId });
      
      if (isGameExist) {
        return isGameExist;
      }
      throw new GameNotFoundException(gameId);
    } catch(err) {
      throw new GameNotFoundException(gameId);
    }

  }

  public async checkIsGameStarted(gameId: string) {
    return this.game.exists({ _id: gameId, isStarted: true });
  }

  public async updateGameStatus(gameId: string, isStarted: boolean) {
    const updatedGame = await this.game.findOneAndUpdate({ _id: gameId }, { isStarted }, { new: true }).exec();

    if (updatedGame) {
      return updatedGame;
    }
    throw new Error(UPDATE_ERROR);

  }

  public async deleteGame(gameId: string) {
    const deletedGame = await this.game.findByIdAndDelete(gameId).exec();

      if (deletedGame) {
        await this.user.deleteMany({ gameId }).exec();
        await this.settings.deleteMany({ gameId }).exec();
        await this.message.deleteMany({ gameId }).exec();;
        await this.issue.deleteMany({ gameId }).exec();

        return deletedGame;
      }
      throw new Error(DELETE_ERROR);

  }
}