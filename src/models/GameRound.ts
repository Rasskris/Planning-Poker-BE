import mongoose from 'mongoose';
import { IGameRound } from '../interfaces';

const GameRoundSchema = new mongoose.Schema({
    roundIsStarted: {
        type: Boolean,
    },
    currentIssue: {
        type: String,
    },
    playerCards: {
        type: Object,
    },
    gameId: {
        type: String,
    },
    roundStatistics: {
        type: Object,
    },
    isActive: {
        type: Boolean,
    },
    scoreTypeValue: {
        type: String,
    }
})


const GameRound = mongoose.model<IGameRound>('GameRound', GameRoundSchema);

const findGameRound = (gameId: string, currentIssue: string) => {
    return GameRound.findOne({ gameId, currentIssue }, { _id: false, __v: false }).exec();
}

export { GameRound, findGameRound }