import { Request, Response, NextFunction, Router } from 'express';
import { Controller, User as UserType } from '../interfaces';
import { User, createGame, checkGameStarted, findGameSettingsByGameId, findDealerByGameId } from '../models';
import { emitLeaveMember, emitNotifyDealer, emitUserUpdate, emitAdmitToGame, emitRejectToGame, emitJoinMember } from '../socket';
import { upload } from '../multer';
import { 
  FETCH_ERROR, 
  SAVE_ERROR, 
  DELETE_ERROR, 
  userRoles, 
  UPDATE_ERROR, 
  AUTO_ADMITED_FALSE, 
  AUTO_ADMITED_TRUE, 
  PENDING_DEALER_ANSWER_TRUE, 
  PENDING_DEALER_ANSWER_FALSE } from '../constants';

type PendingUsers = {
  [id: string]: UserType;
}
class UserController implements Controller {
  public path = '/users';
  public router = Router();
  private user = User;
  private pendingUsers: PendingUsers;

  constructor() {
    this.initializeRoutes();
    this.pendingUsers = {};
  }

  private initializeRoutes() {
    this.router
      .get(`${this.path}/:gameId`, this.getUsers)
      .get(`${this.path}/reject/:id`, this.rejectUser)
      .post(this.path, upload.single('avatar'), this.addUser)
      .put(`${this.path}/admit/:id`, this.admitUser)
      .put(this.path, this.updateUser)
      .delete(this.path, this.deleteUser);
  }

  private getUsers = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const users = await this.user.find({ gameId }).exec();

      if (!users) {
        throw new Error(FETCH_ERROR);
      }
      res.send(users);
    } catch(err) {
      next(err);
    }
  };

  // TODO refactor
  private addUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;

      if (userData.role === userRoles.dealer) {
        const game  = await createGame();
        userData.gameId = game.id;
        const user = new this.user({ ...userData });
        const savedUser = await user.save();
      
        if (!savedUser) {
          throw new Error(SAVE_ERROR);
        }

        res.send({ user: savedUser, ...PENDING_DEALER_ANSWER_FALSE, ...AUTO_ADMITED_FALSE });
        return;
      }
      const user = new this.user({ ...userData });
      const { id, gameId } = user;
      
      const isGameStarted = await checkGameStarted(gameId);
      const currentGameSettings = await findGameSettingsByGameId(gameId);
      const isAutomaticAdmitAfterStartGame = currentGameSettings?.automaticAdmitAfterStartGame;

      const ioServer = req.app.get('socketio');

      if (isGameStarted && !isAutomaticAdmitAfterStartGame) {
        const dealer = await findDealerByGameId(gameId);
        if (!dealer) {
          throw new Error(SAVE_ERROR);
        }
        this.pendingUsers[id] = user;

        emitNotifyDealer(dealer.id, user);

        res.send({ user, ...PENDING_DEALER_ANSWER_TRUE, ...AUTO_ADMITED_FALSE });
        return;
      } else if (isGameStarted && isAutomaticAdmitAfterStartGame) {
        const savedUser = await user.save();
      
        if (!savedUser) {
          throw new Error(SAVE_ERROR);
        }

        res.send({ user: savedUser, ...PENDING_DEALER_ANSWER_FALSE, ...AUTO_ADMITED_TRUE });

        ioServer.to(gameId).emit('memberJoin', savedUser);
        return;
      }

      const savedUser = await user.save();
      
      if (!savedUser) {
        throw new Error(SAVE_ERROR);
      }

      res.send({ user: savedUser, ...PENDING_DEALER_ANSWER_FALSE, ...AUTO_ADMITED_FALSE });

      ioServer.to(gameId).emit('memberJoin', savedUser);
    } catch (err) {
      next(err);
    }
  };

  private updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, selectedCard } = req.body;

      const updatedUser = await this.user.findOneAndUpdate({ _id: id }, { selectedCard }, { new: true, upsert: true }).exec();

      if (!updatedUser) {
        throw new Error(UPDATE_ERROR);
      }

      emitUserUpdate(updatedUser);
      res.send(updatedUser);
    } catch (err) {
      next(err);
    }
  };

  private deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentUserId, victimId } = req.body;
      const ioServer = req.app.get('socketio');
    
      const deletedUser = await this.user.findOneAndDelete({ _id: victimId || currentUserId }).exec();

      if (!deletedUser) {
        throw new Error(DELETE_ERROR);
      }

      victimId 
        ? emitLeaveMember(currentUserId, deletedUser) 
        : ioServer.to(deletedUser.gameId).emit('memberLeave', deletedUser.id);

      res.send(deletedUser);
    } catch (err) {
      next(err);
    }
  };

  private admitUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const savedUser = await this.pendingUsers[id].save();
      
      if (!savedUser) {
        throw new Error(SAVE_ERROR);
      }

      emitAdmitToGame(id);
      
      emitJoinMember(savedUser);
  
      res.send({ id });
      } catch (err) {
      next(err);
    }
  };

  private rejectUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      emitRejectToGame(id);

      res.send({ id });
    } catch (err) {
      next(err);
    }
  };
}

export { UserController };
