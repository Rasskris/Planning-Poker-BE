import { VoteModel } from '../models';
import { User } from '../interfaces';
import { ONE_VOTE, SAVE_ERROR, userRoles } from '../constants';

export class VoteService {
  private vote = VoteModel;

  public async getOpenedVote(gameId: string) {
    return this.vote.findOne({ gameId }).exec(); 
  }

  public async addVote(gameId: string, victimId: string, users: User[]) {
    const savedVote = await this.vote.create({ 
      gameId, 
      countUsersWithoutVictim: users.length - 1,
      countVotesForKick: ONE_VOTE,
      victimId,
    });

    if (!savedVote) {
      throw new Error(SAVE_ERROR);
    }
  }

  public async deleteVote(gameId: string) {
    await this.vote.deleteOne({ gameId }).exec();
  }

  public checkAvailibleVote(users: User[]) {
    const countUsers = users.filter((user) => user.role !== userRoles.dealer);
  
    return countUsers.length >= 3;
  }

  public getPercentVotedForKick(countUsers: number, countVotesForKick: number) {
    const percentVotedForKick = (countVotesForKick / countUsers) * 100;
    
    return percentVotedForKick;
  }

  public addOneVoteForKick (gameId: string, countVotesForKick: number) {
    this.vote.updateOne({ gameId }, { countVotesForKick: countVotesForKick + ONE_VOTE }).exec();
  }

  public addOneVoteAgainstKick (gameId: string, countVotesAgainstKick: number) {
    this.vote.updateOne({ gameId }, { countVotesAgainstKick: countVotesAgainstKick + ONE_VOTE }).exec();
  }
}