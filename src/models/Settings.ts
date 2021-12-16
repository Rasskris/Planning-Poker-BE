import mongoose from 'mongoose';
import { SCORE_TYPE_FN, SCORE_TYPE_SHORT_FN, SCORE_VALUES_FN } from '../constants';
import { Settings } from '../interfaces';

const SettingsSchema = new mongoose.Schema({
    scramMasterAsPlayer: {
        type: Boolean,
        default: false,
    },
    scoreType: {
        type: String,
        default: SCORE_TYPE_FN,
    },
    scoreTypeShort: {
        type: String,
        default: SCORE_TYPE_SHORT_FN,
    },
    timerValues: {
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

export const SettingsModel = mongoose.model<Settings>('Settings', SettingsSchema);
