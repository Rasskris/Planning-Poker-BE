import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { Issue } from '../models';
import { emitIssueAdd, emitIssueUpdate, emitIssueDelete } from '../socket';
import { FETCH_ERROR, SAVE_ERROR, UPDATE_ERROR, DELETE_ERROR } from '../constants';

class IssueController implements Controller {
  public path = '/issues';
  public router = Router();
  private issue = Issue;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .get(`${this.path}/:gameId`, this.getIssues)
      .post(this.path, this.addIssue)
      .put(this.path, this.updateIssue)
      .delete(`${this.path}/:issueId`, this.deleteIssue);
  }

  private getIssues = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const issues = await this.issue.find({ gameId }).exec();

      if (!issues) {
        throw new Error(FETCH_ERROR);
      }
      res.send(issues);
    } catch(err) {
      next(err);
    }
  };

  private addIssue = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const issue = new this.issue({ ...req.body });
      const savedIssue = await issue.save();

      if (!savedIssue) {
        throw new Error(SAVE_ERROR);
      }

      emitIssueAdd(savedIssue);
      res.send(savedIssue);
    } catch (err) {
      next(err);
    }
  };

  private updateIssue = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const issue = req.body;
      const updatedIssue = await this.issue.findByIdAndUpdate(issue.id, issue, { new: true });

      if (!updatedIssue) {
        throw new Error(UPDATE_ERROR);
      }

      emitIssueUpdate(updatedIssue);
      res.send(updatedIssue);
    } catch (err) {
      next(err);
    }
  };

  private deleteIssue = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { issueId } = req.params;
      const deletedIssue = await this.issue.findByIdAndDelete(issueId);

      if (!deletedIssue) {
        throw new Error(DELETE_ERROR);
      }

      emitIssueDelete(deletedIssue);
      res.send(deletedIssue);
    } catch (err) {
      next(err);
    }
  }
}

export { IssueController };