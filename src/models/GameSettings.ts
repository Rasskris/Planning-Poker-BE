import mongoose from 'mongoose';
import { SCORE_TYPE_FN, SCORE_TYPE_SHORT_FN, SCORE_VALUES_FN } from '../constants';
import { GameSettings } from '../interfaces';

const GameSettingsSchema = new mongoose.Schema({
    scramMasterAsPlayerSetting: {
        type: Boolean,
        default: false,
    },
    changingCardInRoundEndSetting: {
        type: Boolean,
        default: false,
    },
    changeSelectionAfterFlippingCardsSetting: {
        type: Boolean,
        default: false,
    },
    automaticFlipCardsSetting: {
        type: Boolean,
        default: false,
    },
    scoreTypeSetting: {
        type: String,
        default: SCORE_TYPE_FN,
    },
    scoreTypeShortSetting: {
        type: String,
        default: SCORE_TYPE_SHORT_FN,
    },
    timerValuesSetting: {
        minutes: {
          type: Number,
          default: 0
        },
        seconds: {
          type: Number,
          default: 0
        }
    },
    gameId: {
        type: String,
        required: true,
    },
    scoreValues: {
        type: Array,
        default: SCORE_VALUES_FN,
    },
    automaticAdmitAfterStartGame: {
        type: Boolean,
        default: false,
    }
})

const GameSettings = mongoose.model<GameSettings>('GameSettings', GameSettingsSchema);

const deleteGameSettingsByGameId = (gameId: string) => {
    return GameSettings.deleteMany({ gameId }).exec();
};

const findGameSettingsByGameId = (gameId: string) => {
    return GameSettings.findOne({ gameId }).exec();
};

const createGameSettings = (gameId: string) => {
    return new GameSettings({ gameId }).save();
  };

const checkIsTimerNedeed = (gameId: string) => {
    return GameSettings.exists({ gameId, isTimerNeededSetting: true });
};

export { 
    GameSettings, 
    deleteGameSettingsByGameId, 
    findGameSettingsByGameId, 
    createGameSettings,
    checkIsTimerNedeed,
};