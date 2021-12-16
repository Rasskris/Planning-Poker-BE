import { Request, Response, NextFunction, Router } from 'express';
import { Controller } from '../interfaces';
import { GameService, UsersService } from '../services';
import { emitLeaveMember, emitNotifyDealer, emitUserUpdate, emitAdmitToGame, emitRejectToGame, emitJoinMember } from '../socket';
import { upload } from '../multer';
import {
  userRoles, 
  AUTO_ADMITED_FALSE, 
  AUTO_ADMITED_TRUE, 
  PENDING_DEALER_ANSWER_TRUE, 
  PENDING_DEALER_ANSWER_FALSE } from '../constants';

class UserController implements Controller {
  public path = '/users';
  public router = Router();

  constructor(
    private usersService: UsersService,
    private gameService: GameService,
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .get(`${this.path}/:gameId`, this.getUsers)
      .post(this.path, upload.single('avatar'), this.addUser)
      .put(this.path, this.updateUser)
      .put(`${this.path}/admit/:id`, this.admitUser)
      .put(`${this.path}/reject/:id`, this.rejectUser)
      .delete(`${this.path}/:id`, this.deleteUser)
      .delete(`${this.path}/victim/:id`, this.deleteVictim);
  }

  private getUsers = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const users = await this.usersService.getUsers(gameId);

      res.send(users);
    } catch(err) {
      next(err);
    }
  };

  // TODO refactor
  private addUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ioServer = req.app.get('socketio');
      const userData = req.body;
      const { gameId } = userData;

      if (userData.role === userRoles.dealer) {
        const dealer = await this.usersService.addDealer(userData);

        return res.send({ user: dealer, ...PENDING_DEALER_ANSWER_FALSE, ...AUTO_ADMITED_FALSE });
      }

      const isGameStarted = await this.gameService.checkIsGameStarted(gameId);

      if (!isGameStarted) {
        const savedUser = await this.usersService.addUser(userData);

        ioServer.to(gameId).emit('memberJoin', savedUser);

        return res.send({ user: savedUser, ...PENDING_DEALER_ANSWER_FALSE, ...AUTO_ADMITED_FALSE });
      }
      
      const isNeedSendNotificationToDealer = await this.usersService.isNeedSendNotificationToDealer(gameId);

      if (isNeedSendNotificationToDealer) {
        const pendingUser = await this.usersService.createPendingUser(userData);
        const { id: dealerId } = await this.usersService.getDealer(gameId);

        emitNotifyDealer(dealerId, pendingUser);
  
        return res.send({ user: pendingUser, ...PENDING_DEALER_ANSWER_TRUE, ...AUTO_ADMITED_FALSE });
      }
      const savedUser = await this.usersService.addUser(userData);

      ioServer.to(gameId).emit('memberJoin', savedUser);

      return res.send({ user: savedUser, ...PENDING_DEALER_ANSWER_FALSE, ...AUTO_ADMITED_TRUE });
    } catch (err) {
      next(err);
    }
  };

  private updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, selectedCard } = req.body;
      console.log('req selected card >>', selectedCard);
      const updatedUser = await this.usersService.updateUserSelectedCard(id, selectedCard);
      console.log('updated user >>>', updatedUser);
      emitUserUpdate(updatedUser);
      res.send(updatedUser);
    } catch (err) {
      next(err);
    }
  };

  private deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
    
      const deletedUser = await this.usersService.deleteUser(id);

      emitLeaveMember(deletedUser);

      res.send(deletedUser);
    } catch (err) {
      next(err);
    }
  };

  private deleteVictim = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ioServer = req.app.get('socketio');
      const deletedVictim = await this.usersService.deleteUser(id);
      const { gameId, id: userId } = deletedVictim;

      ioServer.to(gameId).emit('memberLeave', userId);

      res.send(deletedVictim);
    } catch(err) {
      next(err)
    }
  }

  private admitUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const savedUser = await this.usersService.savePendingUserToDatabase(id);

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
      this.usersService.deletePendingUser(id);

      emitRejectToGame(id);

      res.send({ id });
    } catch (err) {
      next(err);
    }
  };
}

export { UserController };