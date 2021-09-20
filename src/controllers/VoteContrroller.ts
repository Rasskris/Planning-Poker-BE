import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { Vote, findUsersByGameId, deleteUserById } from '../models';
import { emitLeaveMember, emitVote } from '../socket';
import { checkAvailibleVote, getPercentVotedForKick } from '../utils';
import { FETCH_ERROR, SAVE_ERROR, DELETE_ERROR, HALF_OF_USERS, ONE_VOTE } from '../constants';

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
      const { gameId, victim, userId } = req.body;
      const users = await findUsersByGameId(gameId);
      const isVoteAvailible = checkAvailibleVote(users);
      
      if (!isVoteAvailible) {
        res.send({ success: false });
      }
      const vote = new this.vote({ 
        gameId, 
        countUsers: users.length, 
        countVotesFor: ONE_VOTE,
        victimId: victim.id,
      });
      const savedVote = await vote.save();
      
      if (!savedVote) {
        throw new Error(SAVE_ERROR);
      }

      emitVote(userId, gameId, victim);
    } catch (err) {
      next(err);
    }
  }

  private putVoteFor = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.body;
      const currentVote = await this.vote.findById({ gameId });

      if (!currentVote) {
        throw new Error(FETCH_ERROR);
      }
      const { countUsers, countVotesFor, victimId } = currentVote;
      const percentVotedFor = getPercentVotedForKick(countUsers, countVotesFor);
      
      if (!(percentVotedFor >= HALF_OF_USERS)) {
        await this.vote.updateOne(gameId, { countVotesFor: countVotesFor + ONE_VOTE });
      } else {
        const deletedUser = await deleteUserById(victimId);

        if (!deletedUser) {
          throw new Error(DELETE_ERROR);
        }

        await this.vote.deleteOne({ gameId }).exec();

        emitLeaveMember(deletedUser);
        res.send({ success: true });
      }
    } catch(err) {
      next(err);
    }
  };
}

export { VoteController };