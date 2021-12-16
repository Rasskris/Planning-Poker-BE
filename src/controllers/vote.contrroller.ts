import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { emitVote } from '../socket';
import { SUCCESS_TRUE, SUCCESS_FALSE, HALF_OF_USERS, ONE_VOTE } from '../constants';
import { UsersService, VoteService } from '../services';

class VoteController implements Controller {
  public path = '/vote';
  public router = Router();

  constructor(
    private voteService: VoteService,
    private userService: UsersService,
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .post(this.path, this.addVote)
      .put(`${this.path}/for`, this.addVoteForKick)
      .put(`${this.path}/against`, this.addVoteAgainstKick);
  }

  
  private addVote = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId, victimId, currentUserId } = req.body;
      const users = await this.userService.getUsers(gameId);
      const isVoteAvailible = this.voteService.checkAvailibleVote(users);

      if (!isVoteAvailible) {
        return res.send(SUCCESS_FALSE);
      }

      await this.voteService.addVote(gameId, victimId, users);

      res.send(SUCCESS_TRUE);
      emitVote(currentUserId, gameId, victimId);
    } catch (err) {
      next(err);
    }
  }

  private addVoteForKick = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.body;
      const openedVote = await this.voteService.getOpenedVote(gameId);

      if (!openedVote) {
        return res.send(SUCCESS_FALSE);
      }

      const { countUsersWithoutVictim, countVotesForKick, victimId } = openedVote;
      const percentVotedForKick = this.voteService.getPercentVotedForKick(countUsersWithoutVictim, countVotesForKick);
      const isVoteFinished = percentVotedForKick > HALF_OF_USERS

      if (!isVoteFinished) {
        await this.voteService.addOneVoteForKick(gameId, countVotesForKick);

        return res.send(SUCCESS_FALSE);
      } 
      const ioServer = req.app.get('socketio');
      const { id: deletedUserId } = await this.userService.deleteUser(victimId);

      this.voteService.deleteVote(gameId);

      ioServer.to(gameId).emit('memberLeave', deletedUserId);

      res.send({ ...SUCCESS_TRUE, id: deletedUserId });
    } catch(err) {
      next(err);
    }
  }

  private addVoteAgainstKick = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.body;
      const openedVote = await this.voteService.getOpenedVote(gameId);
      console.log('opened Vote >>', openedVote);
      if (!openedVote) {
        return res.send(SUCCESS_FALSE);
      }

      const { countUsersWithoutVictim, countVotesAgainstKick, countVotesForKick } = openedVote;
      const isVoteFinished = (countVotesAgainstKick + countVotesForKick) === countUsersWithoutVictim;

      if (!isVoteFinished) {
        await this.voteService.addOneVoteAgainstKick(gameId, countVotesForKick);

        return res.send(SUCCESS_FALSE);
      } 

      this.voteService.deleteVote(gameId);

      res.send({ ...SUCCESS_TRUE });
    } catch (err) {
      next(err)
    }
}
}

export { VoteController };