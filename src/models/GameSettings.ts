import mongoose from 'mongoose';
import { GameSettings } from '../interfaces';

const GameSettingsSchema = new mongoose.Schema({
    scramMasterAsPlayerSetting: {
        type: Boolean,
    },
    changingCardInRoundEndSetting: {
        type: Boolean,
    },
    isTimerNeededSetting: {
        type: Boolean,
    },
    changeSelectionAfterFlippingCardsSetting: {
        type: Boolean,
    },
    automaticFlipCardsSetting: {
        type: Boolean,
    },
    scoreTypeSetting: {
        type: String,
    },
    scoreTypeShortSetting: {
        type: String,
    },
    timerValuesSetting: {
        type: Object,
    },
    gameId: {
        type: String,
        required: true,
    },
    scoreValues: {
        type: Array,
    }
})

const GameSettings = mongoose.model<GameSettings>('GameSettings', GameSettingsSchema);

const deleteGameSettingsByGameId = (gameId: string) => {
    return GameSettings.deleteMany({ gameId }).exec();
};

const findGameSettingsByGameId = (gameId: string) => {
    return GameSettings.find({ gameId }).exec();
};

export { GameSettings, deleteGameSettingsByGameId, findGameSettingsByGameId }