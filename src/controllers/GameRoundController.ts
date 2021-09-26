import { Request, Response, NextFunction, Router } from 'express';
import { Controller, IObjectType } from '../interfaces';
import { FETCH_ERROR, SAVE_ERROR, DELETE_ERROR, userRoles } from '../constants';
import { findGameRound, GameRound } from '../models';
import { emitGetRoundStatistic, emitResetGameRoundData, emitStartGameRound, emitUpdateGameRoundData } from '../socket';

class GameRoundController implements Controller {
    public path = '/gameround';
    public router = Router();
    private gameRound = GameRound;


    constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes() {
        this.router
          .get(`${this.path}/:gameId`, this.getDataAllRoomsOfGame)
          .post(`${this.path}/:gameId`, this.addGameRoundData)
          .put(`${this.path}/usersUpdate/:gameId`, this.updateGameRoundUsers)
          .put(`${this.path}/roundStatistics/:gameId`, this.updateGameRoundStatistics)
          .get(`${this.path}/roundStatistics/:gameId`, this.getRoundStatistic)
      }

    private addGameRoundData = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId } = req.params;
            const {currentIssue, playerCards, userId } = req.body;
            // формирование объекта с ключами (игрок:карта) из массива игроков
            // необходимо в т.ч. для обнуления значений карт в случае рестарта раунда
            const objPlayerCards = {} as IObjectType;
               playerCards.forEach((playerCard: string) => {
                objPlayerCards[playerCard] = null;
            });
            const objRoundStatistics = {} as IObjectType;
            // удаляет старые данные о таких же раундах текущей игры, если они были (в случае рестарта раунда)
            await this.gameRound.findOneAndDelete({ gameId, currentIssue }).exec();
            // создаём коллекцию в базе данных нового раунда
            const gameRound = new this.gameRound({
                currentIssue, 
                playerCards: objPlayerCards, 
                gameId, 
                roundIsStarted: true, 
                isActive: true, 
                roundStatistics: objRoundStatistics })
            const savedRoundData = await gameRound.save();
                if (!savedRoundData) {
                  throw new Error(SAVE_ERROR);
                }
            // получаем результирующее значение из базы данных с исключением лишних полей
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
            const { gameRoundData, valueSelectedGameCard, userId } = req.body;
            const { currentIssue } = gameRoundData;
            const updateGameRoundData = await this.gameRound.findOne({ gameId, currentIssue }).exec();
            if (updateGameRoundData) updateGameRoundData.playerCards[`${userId}`] = valueSelectedGameCard;
            const savedRoundData = await this.gameRound.findOneAndUpdate({ gameId, currentIssue }, { ...updateGameRoundData }).exec();
            if(!savedRoundData) {
                throw new Error(FETCH_ERROR);
            }
            // получаем результирующее значение из базы данных с исключением лишних полей
            const resultingGameRoundData = await findGameRound(gameId, currentIssue);
            if (resultingGameRoundData) emitUpdateGameRoundData(userId, gameId, resultingGameRoundData);
            res.send(resultingGameRoundData);
        } catch (err) {
            next(err);
        }
    }

    private updateGameRoundStatistics = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId } = req.params;
            const { userId, gameRoundData } = req.body;
            const { currentIssue, roundStatistics } = gameRoundData;
            const updateGameRoundData = await this.gameRound.findOne({ gameId, currentIssue }).exec();
            if (updateGameRoundData) updateGameRoundData.roundStatistics = roundStatistics;
            const savedRoundData = await this.gameRound.findOneAndUpdate({ gameId, currentIssue }, { ...updateGameRoundData }).exec();
            if(!savedRoundData) {
                throw new Error(FETCH_ERROR);
            }
            // получаем результирующее значение из базы данных с исключением лишних полей
            // const resultingGameRoundData = await findGameRound(gameId, currentIssue);
            // if (resultingGameRoundData) emitUpdateGameRoundData(userId, gameId, resultingGameRoundData);
            emitResetGameRoundData(userId, gameId);
            res.send(true);
        } catch (err) {
            next(err);
        }
    }

    private getDataAllRoomsOfGame = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId } = req.params;
            const gameRounds = await this.gameRound.find({ gameId }).exec();

            if(!gameRounds) {
                throw new Error(FETCH_ERROR);
            }

            res.send(gameRounds);
        } catch (err) {
            next(err);
        }
    }

    private getRoundStatistic = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId } = req.params;
            const { userId, currentIssue } = req.body;
            const gameRoundData = await this.gameRound.findOne({ gameId, currentIssue }).exec();

            if(!gameRoundData) {
                throw new Error(FETCH_ERROR);
            }
            const roundStatistic = gameRoundData.roundStatistics;

            emitGetRoundStatistic(userId, gameId, roundStatistic);
            res.send(roundStatistic);
        } catch (err) {
            next(err);
        }
    }



}

export { GameRoundController }