import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { emitIssueAdd, emitIssueUpdate, emitIssueDelete, emitIssueListUpdate } from '../socket';
import { ROUND_STATUS } from '../constants';
import { IssuesService } from '../services';

class IssueController implements Controller {
  public path = '/issues';
  public router = Router();

  constructor(
    private issuesService: IssuesService,
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .get(`${this.path}/:gameId`, this.getIssues)
      .post(this.path, this.addIssue)
      .put(`${this.path}/current`, this.updateCurrentIssue)
      .put(`${this.path}/done`, this.updateDoneIssue)
      .delete(`${this.path}/:issueId`, this.deleteIssue);
  }

  private getIssues = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const issues = await this.issuesService.getIssues(gameId);

      res.send(issues);
    } catch(err) {
      next(err);
    }
  };

  private addIssue = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const savedIssue = await this.issuesService.addIssue(req.body);

      emitIssueAdd(savedIssue);
      res.send(savedIssue);
    } catch (err) {
      next(err);
    }
  };

  private updateCurrentIssue = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, gameId, creatorId } = req.body;
      const updatedIssueList = await this.issuesService.updateIssueListAfterSelectedCurrentIssue(id, gameId);

      emitIssueListUpdate(gameId, creatorId, updatedIssueList);
      res.send(updatedIssueList);
    } catch (err) {
      next(err);
    }
  };

  private updateDoneIssue = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: issueId, gameId, creatorId, statistics } = req.body;
      const updatedIssue = await this.issuesService.updateDoneIssue(issueId, statistics);

      emitIssueUpdate(gameId, creatorId, updatedIssue);

      res.send(updatedIssue);
    } catch (err) {
      next(err);
    }
  };

  private deleteIssue = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { issueId } = req.params;
      const deletedIssue = await this.issuesService.deleteIssue(issueId);

      emitIssueDelete(deletedIssue);
      res.send(deletedIssue);
    } catch (err) {
      next(err);
    }
  }
}

export { IssueController };