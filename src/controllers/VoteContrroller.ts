import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { Vote, findUsersByGameId, deleteUserById } from '../models';
import { emitLeaveMember, emitVote } from '../socket';
import { checkAvailibleVote, getPercentVotedForKick } from '../utils';
import { SUCCESS_TRUE, SUCCESS_FALSE, SAVE_ERROR, DELETE_ERROR, HALF_OF_USERS, ONE_VOTE } from '../constants';

class VoteController implements Controller {
  public path = '/vote';
  public router = Router();
  private vote = Vote;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .post(this.path, this.addVote)
      .put(this.path, this.putVoteFor)
  }

  
  private addVote = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId, victimId, currentUserId } = req.body;
      const users = await findUsersByGameId(gameId);
      const isVoteAvailible = checkAvailibleVote(users);

      if (!isVoteAvailible) {
        res.send(SUCCESS_FALSE);
        return;
      }
      const vote = new this.vote({ 
        gameId, 
        countUsers: users.length, 
        countVotesFor: ONE_VOTE,
        victimId,
      });

      const savedVote = await vote.save();
      
      if (!savedVote) {
        throw new Error(SAVE_ERROR);
      }

      res.send(SUCCESS_TRUE);
      emitVote(currentUserId, gameId, victimId);
    } catch (err) {
      next(err);
    }
  }

  private putVoteFor = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentUserId, gameId } = req.body;
      const currentVote = await this.vote.findOne({ gameId });

      if (!currentVote) {
        res.send(SUCCESS_FALSE);
        return;
      }
      const { countUsers, countVotesFor, victimId } = currentVote;
      const percentVotedFor = getPercentVotedForKick(countUsers, countVotesFor);
      
      if (!(percentVotedFor >= HALF_OF_USERS)) {
        await this.vote.updateOne({ gameId }, { countVotesFor: countVotesFor + ONE_VOTE });
        res.send(SUCCESS_FALSE);
      } else {
        const deletedUser = await deleteUserById(victimId);

        if (!deletedUser) {
          throw new Error(DELETE_ERROR);
        }

        await this.vote.deleteOne({ gameId }).exec();

        emitLeaveMember(currentUserId, deletedUser);

        res.send({ ...SUCCESS_TRUE, id: deletedUser.id });
      }
    } catch(err) {
      next(err);
    }
  };
}

export { VoteController };