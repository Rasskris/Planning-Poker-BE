import { Request, Response, NextFunction, Router } from 'express';
import { Controller, IObjectType, Timer } from '../interfaces';
import { FETCH_ERROR, SAVE_ERROR, DELETE_ERROR, userRoles } from '../constants';
import { findGameRound, GameRound, GameSettings } from '../models';
import { emitResetGameRoundData, emitStartGameRound, emitUpdateGameRoundData, emitUpdateGameRoundStatistics } from '../socket';
import { SocketTimer } from '../utils/SocketTimer';

type Timers = {
    [key: string]: SocketTimer;
  }


class GameRoundController implements Controller {
    public path = '/gameround';
    public router = Router();
    private gameRound = GameRound;
    private timers: Timers;
    private gameSettings = GameSettings;


    constructor() {
        this.initializeRoutes();
        this.timers = {};
    }
    
    private initializeRoutes() {
        this.router
          .get(`${this.path}/:gameId`, this.getDataAllRoundsOfGame)
          .post(`${this.path}/:gameId`, this.addGameRoundData)
          .put(`${this.path}/usersUpdate/:gameId`, this.updateGameRoundUsers)
          .put(`${this.path}/roundStatistics/:gameId`, this.updateGameRoundStatistics)
          .delete(`${this.path}/:gameId`, this.deleteGameRoundData)
          .delete(`${this.path}/reset/:gameId`, this.resetGameRoundData)
      }

    private addGameRoundData = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId } = req.params;
            const {currentIssue, playerCards, userId, scoreTypeValue } = req.body;
            // forming an object with keys (player: card) from an array of players
            // necessary incl. to reset card values ​​in case of round restart
            const newPlayerCards = {} as IObjectType;
               playerCards.forEach((playerCard: string) => {
                newPlayerCards[playerCard] = null;
            });
            const newRoundStatistics = {} as IObjectType;
            // deletes old data about the same rounds of the current game, if any (in case of a round restart)
            await this.gameRound.findOneAndDelete({ gameId, currentIssue }).exec();
            // create a collection in the database for a new round
            const gameRound = new this.gameRound({
                currentIssue, 
                playerCards: newPlayerCards, 
                gameId, 
                roundIsStarted: true, 
                isActive: true, 
                roundStatistics: newRoundStatistics,
                scoreTypeValue })
            const savedRoundData = await gameRound.save();
                if (!savedRoundData) {
                  throw new Error(SAVE_ERROR);
                }

            //stop and delete the timer, if it was started
            if (this.timers[gameId]) this.timers[gameId].clearTimer();
            //start the timer
            const ioServer = req.app.get('socketio');
            const gameSettings = await this.gameSettings.findOne({ gameId }).exec();
            const minutes = gameSettings?.timerValuesSetting.minutes;
            const seconds = gameSettings?.timerValuesSetting.seconds;
            if (minutes !== undefined && seconds !== undefined) {
              this.startTimer({ minutes, seconds, ioServer, gameId });
            }
            // get the resulting value from the database, excluding unnecessary fields
            const resultingGameRoundData = await findGameRound(gameId, currentIssue);
            if (resultingGameRoundData) emitStartGameRound(userId, gameId, resultingGameRoundData);
            res.send(resultingGameRoundData);
        } catch (err) {
            next(err);
        }
    }

    private updateGameRoundUsers = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId } = req.params;
            const { currentIssue, valueSelectedGameCard, userId } = req.body;
            const updateGameRoundData = await this.gameRound.findOne({ gameId, currentIssue }).exec();
            if (updateGameRoundData) updateGameRoundData.playerCards[`${userId}`] = valueSelectedGameCard;
            const savedRoundData = await this.gameRound.findOneAndUpdate({ gameId, currentIssue }, { ...updateGameRoundData }).exec();
            if(!savedRoundData) {
                throw new Error(FETCH_ERROR);
            }
            // get the resulting value from the database, excluding unnecessary fields
            const resultingGameRoundData = await findGameRound(gameId, currentIssue);
            const playerCards = resultingGameRoundData?.playerCards;
            if (resultingGameRoundData) emitUpdateGameRoundData(userId, gameId, playerCards);
            res.send(playerCards);
        } catch (err) {
            next(err);
        }
    }

    private updateGameRoundStatistics = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId } = req.params;
            const { userId, gameRoundData, roundStatistics, currentIssue } = req.body;
            const updateGameRoundData = await this.gameRound.findOne({ gameId, currentIssue }).exec();
            if (updateGameRoundData) updateGameRoundData.roundStatistics = roundStatistics;
            const savedRoundData = await this.gameRound.findOneAndUpdate({ gameId, currentIssue }, { ...updateGameRoundData }).exec();
            if(!savedRoundData) {
                throw new Error(FETCH_ERROR);
            }
            emitUpdateGameRoundStatistics(userId, gameId, roundStatistics);
            res.send(roundStatistics);
        } catch (err) {
            next(err);
        }
    }

    private getDataAllRoundsOfGame = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId } = req.params;
            const gameRounds = await this.gameRound.find({$and: [{gameId}, {roundStatistics: {$exists:true}}, {roundStatistics: {$ne: {}}}] }).exec();

            if(!gameRounds) {
                throw new Error(FETCH_ERROR);
            }

            res.send(gameRounds);
        } catch (err) {
            next(err);
        }
    }

    private deleteGameRoundData = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId } = req.params;
            const { userId, currentIssue } = req.body;
            const deleteGameRoundData = await this.gameRound.findOneAndDelete({ gameId, currentIssue }).exec();
            if(!deleteGameRoundData) {
                throw new Error(FETCH_ERROR);
            }
            res.send(deleteGameRoundData);
        } catch (err) {
            next(err);
        }
    }

    private resetGameRoundData = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId } = req.params;
            const { userId } = req.body;
            emitResetGameRoundData(gameId, userId);
            res.send(true);
        } catch (err) {
            next(err);
        }
    }

    private startTimer = ({ minutes, seconds, ioServer, gameId }: Timer) =>  {
        this.timers[gameId] = new SocketTimer({ minutes, seconds, ioServer, gameId });
        this.timers[gameId].startCountdown();
      }

}

export { GameRoundController }