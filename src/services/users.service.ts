import { UserModel } from '../models';
import { GameService } from './game.service';
import { SettingsService } from './settings.service';
import { SelectedCard, User } from '../interfaces';
import { DELETE_ERROR, FETCH_ERROR, SAVE_ERROR, UPDATE_ERROR, userRoles, VALUE_UNKNOWN } from '../constants';

type PendingUsers = {
  [id: string]: User;
}

export class UsersService {
  private user = UserModel;
  private pendingUsers: PendingUsers;

  constructor(
    private gameService: GameService,
    private settingsService: SettingsService,
  ) {
    this.pendingUsers = {};
  }

  public async getUsers(gameId: string) {
    const users = await this.user.find({ gameId }).exec();

    if (users) {
      return users;
    }
    throw new Error(FETCH_ERROR);
  }

  public async addUser(userData: User) {
    const savedUser = await this.user.create(userData);
    console.log('saved user', savedUser);
    if (savedUser) {
      return savedUser;
    }
    throw new Error(SAVE_ERROR);
  }

  public async createPendingUser(userData: User) {
    const user = await new this.user({ ...userData });
    this.pendingUsers[user.id] = user;

    return user;
  }

  public deletePendingUser(userId: string) {
    delete this.pendingUsers[userId];
  }

  public async savePendingUserToDatabase(userId: string) {
    const savedUser = await this.pendingUsers[userId].save();

    if (savedUser) {
      this.deletePendingUser(userId);

      return savedUser;
    }
    throw new Error(SAVE_ERROR);
  }

  public async addDealer(userData: User) {
    const game = await this.gameService.createGame();
    userData.gameId = game.id;

    return this.addUser(userData);
  }

  public async updateUserSelectedCard(id: string, selectedCard: SelectedCard) {
    const updatedUser = await this.user.findOneAndUpdate({ _id: id }, { selectedCard }, { new: true }).exec();

    if (updatedUser) {
      return updatedUser;
    }
    throw new Error(UPDATE_ERROR);
  }

  public async deleteUser(id: string) {
    const deletedUser = await this.user.findOneAndDelete({ _id: id }).exec();

    if (deletedUser) {
      return deletedUser;
    }
    throw new Error(DELETE_ERROR);
  }

  public async deleteUsers(gameId: string) {
    await this.user.deleteMany({ gameId }).exec();
  }

  public async getDealer(gameId: string) {
    const dealer = await this.user.findOne({ gameId, role: userRoles.dealer }).exec();

    if (dealer) {
      return dealer;
    }
    throw new Error(FETCH_ERROR);
  }

  public async isNeedSendNotificationToDealer(gameId: string) {
    const currentSettings = await this.settingsService.getSettings(gameId);
    const isAutomaticAdmitAfterStartGame = currentSettings?.automaticAdmitAfterStartGame;

    return !isAutomaticAdmitAfterStartGame;
  }
}