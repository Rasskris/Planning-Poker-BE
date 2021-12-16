import { DELETE_ERROR, FETCH_ERROR, SAVE_ERROR, UPDATE_ERROR } from '../constants';
import { Issue, IssueStatistics } from '../interfaces';
import { IssueModel } from '../models';

export class IssuesService {
  private issue = IssueModel;

  public async getIssues(gameId: string) {
    const issues = await this.issue.find({ gameId }).exec();

      if (issues) {
        return issues;
      }
      throw new Error(FETCH_ERROR);
  }

  public async addIssue(issue: Issue) {
    const savedIssue = await this.issue.create(issue);

    if (savedIssue) {
      return savedIssue;
    }
    throw new Error(SAVE_ERROR);
  }

  public async updateDoneIssue(issueId: string, statistics: Array<IssueStatistics>) {
    const updatedIssue = await this.issue.findOneAndUpdate({ _id: issueId }, { isDone: true, statistics }, { new: true }).exec();

    if (updatedIssue) {
      return updatedIssue;
    }
    throw new Error(UPDATE_ERROR);
  }

  public async deleteIssue(issueId: string) {
    const deletedIssue = await this.issue.findByIdAndDelete(issueId);

    if (deletedIssue) {
      return deletedIssue;
    }
    throw new Error(DELETE_ERROR);
  }

  public async updateIssueListAfterSelectedCurrentIssue(issueId: string, gameId: string) {
    await this.issue.updateMany({ gameId }, { isCurrent: false });
    await this.issue.updateOne({ _id: issueId }, { isCurrent: true }, { new: true });

    const updatedIssueList = await this.issue.find({ gameId }).exec();

    return updatedIssueList;
  }
}