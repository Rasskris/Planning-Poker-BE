import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { Issue } from '../models';
import { emitIssueAdd, emitIssueUpdate, emitIssueDelete, emitIssueListAdd } from '../socket';
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
      .post(`${this.path}/list`, this.addIssueList)
      .put(this.path, this.updateIssue)
      .put(`${this.path}/status`, this.updateIssueStatus)
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

  private addIssueList = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const issueListData = req.body;
      console.log('issueList data', issueListData);
      const savedIssueList = await this.issue.insertMany(issueListData);
      if (!savedIssueList) {
        throw new Error(SAVE_ERROR);
      }
      console.log('saved issue list', savedIssueList);

      emitIssueListAdd(savedIssueList);
      res.send(savedIssueList);
    } catch (err) {
      next(err);
    }
  };

  private updateIssue = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, gameId, creatorId } = req.body;

      await this.issue.updateMany({ gameId }, { isCurrent: false });
      await this.issue.updateOne({ _id: id }, { isCurrent: true }, { new: true });

      const updatedIssues = await this.issue.find({ gameId }).exec();

      emitIssueUpdate(gameId, creatorId, updatedIssues);
      res.send(updatedIssues);
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

  private updateIssueStatus = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, gameId, creatorId } = req.body;
  
      await this.issue.updateOne({ _id: id }, { done: true });
  
      const updatedIssues = await this.issue.find({ gameId }).exec();
  
      emitIssueUpdate(gameId, creatorId, updatedIssues);
      res.send(updatedIssues);
    } catch (err) {
      next(err);
    }
  };
}


export { IssueController };