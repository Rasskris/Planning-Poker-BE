import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { User, createGame } from '../models';
import { emitJoinMember, emitLeaveMember } from '../socket';
import { ERROR_OF_FETCH, ERROR_OF_SAVE, ERROR_OF_DELETE, userRoles } from '../constants';

class UserController implements Controller {
  public path = '/users';
  public router = Router();
  private user = User;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .get(`${this.path}/:gameId`, this.getUsers)
      .post(this.path, this.addUser)
      .delete(`${this.path}/:userId`, this.deleteUser);
  }

  private getUsers = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const users = await this.user.find({ gameId }).exec();

      if (!users) {
        throw new Error(ERROR_OF_FETCH);
      }
      res.send(users);
    } catch(err) {
      next(err);
    }
  };

  private addUser = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const userDate = req.body;
      console.log(userDate);
      if (userDate.role === userRoles.dealer) {
        const game  = await createGame();
        console.log(game);
        userDate.gameId = game.id;
      }
      const user = new this.user({ ...userDate });
      const savedUser = await user.save();

      if (!savedUser) {
        throw new Error(ERROR_OF_SAVE);
      }

      res.send(savedUser);
    } catch (err) {
      next(err);
    }
  };

  //TODO set the vote of to kick user
  private deleteUser = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const deletedUser = await this.user.findOneAndDelete({ id: userId });

      if (!deletedUser) {
        throw new Error(ERROR_OF_DELETE);
      }

      emitLeaveMember(deletedUser);
      res.send(deletedUser);
    } catch (err) {
      next(err);
    }
  }
}

export { UserController };
