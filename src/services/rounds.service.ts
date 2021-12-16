import type { Server as ioServer } from 'socket.io';
import { RoundModel, SettingsModel, UserModel } from '../models';
import { SocketTimer } from '../utils';
import { Timer } from '../interfaces';
import { FETCH_ERROR, ROUND_STATUS, UPDATE_ERROR, VALUE_UNKNOWN } from '../constants';
import { SettingsService, UsersService } from '.';

type Timers = {
  [key: string]: SocketTimer;
}

export class RoundsService {
  private round = RoundModel;
  private user = UserModel;
  private settings = SettingsModel;
  private timers: Timers;

  constructor() {
    this.timers = {};
  }

  public async getRoundStatus(gameId: string) {
    const round = await this.round.findOne({ gameId }).exec();

    if (round) {
      return round.roundStatus;
    }
    throw new Error(FETCH_ERROR);
  }

  private async updateRoundStatus(gameId: string, roundStatus: ROUND_STATUS) {
    const updatedRound = await this.round.updateOne({ gameId }, { roundStatus }).exec();

    if (!updatedRound) {
      throw new Error(UPDATE_ERROR);
    }
  }

  public async startRound(gameId: string, ioServer: ioServer) {
    await this.updateRoundStatus(gameId, ROUND_STATUS.STARTED);

    const currentSettings = await this.settings.findOne({ gameId }).exec()

    if (!currentSettings) {
      throw new Error(FETCH_ERROR);
    }

    const { timerValues, scoreTypeShort } = currentSettings;
    const { minutes, seconds } = timerValues;

    await this.resetUserSelectedCard(gameId, scoreTypeShort);

    this.startTimer({ minutes, seconds, ioServer, gameId });

    return { scoreTypeShort, roundStatus: ROUND_STATUS.STARTED };
  }

  public async finishRound(gameId: string) {
    await this.updateRoundStatus(gameId, ROUND_STATUS.FINISHED);
    this.stopTimer(gameId);

    return { roundStatus: ROUND_STATUS.FINISHED };
  }

  private startTimer ({ minutes, seconds, ioServer, gameId }: Timer) {
    this.timers[gameId] = new SocketTimer({ minutes, seconds, ioServer, gameId });
    this.timers[gameId].startCountdown();
  }

  private stopTimer (gameId: string) {
    this.timers[gameId].clearTimer();
  }

  private async resetUserSelectedCard(gameId: string, scoreType: string) {
    const selectedCard = {
      scoreType,
      scoreValue: VALUE_UNKNOWN,
    };
  
    await this.user.updateMany({ gameId }, { selectedCard }).exec();
  }
}

