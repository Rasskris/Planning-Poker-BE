import type { Socket } from "socket.io";
import { Message, Issue, User, GameSettings, IGameRound, IObjectType } from '../interfaces';
import { findUserById } from "../models";

const sockets: any = {};

export const onConnection = (socket: Socket) => {
  const { userId } = socket.handshake.auth;
  sockets[userId] = socket;

  socket.on('joinToRoom', (gameId) =>  {
    joinToRoom(socket, gameId);
  });

  socket.on('disconnect', (reason) => {
    delete sockets[userId];
  });
};

export const joinToRoom = (socket: Socket, gameId: string) => {
  socket.join(gameId);
};

export const leaveRoom = (socket: Socket, gameId: string) => {
  socket.leave(gameId);
};

export const emitJoinMember = (user: User) => {
  const {id, gameId } = user;

  sockets[id].to(gameId).emit('memberJoin', user);
};

export const emitLeaveMember = (currentUserId: string, deletedUser: User) => {
  const {id: deletedUserId, gameId, firstName } = deletedUser;

  sockets[currentUserId].to(gameId).emit('memberLeave', deletedUserId);
  leaveRoom(sockets[deletedUserId], gameId);
};

export const emitUserUpdate = (updatedUser: User) => {
const { id: userId, gameId } = updatedUser;

sockets[userId].to(gameId).emit('userUpdate', updatedUser);
};

export const emitMessage = (userId: string, gameId: string, message: Message) => {
  sockets[userId].to(gameId).emit('message', message);
};

export const emitIssueAdd = (issue: Issue) => {
  const { creatorId, gameId } = issue;

  sockets[creatorId].to(gameId).emit('issueAdd', issue);
};

export const emitIssueUpdate = (gameId: string, creatorId: string, issues: Issue[]) => {
  sockets[creatorId].to(gameId).emit('issueUpdate', issues);
};

export const emitIssueDelete = (issue: Issue) => {
  const { id, creatorId, gameId } = issue;

  sockets[creatorId].to(gameId).emit('issueDelete', id);
};

export const emitVote = async (currentUserId: string, gameId: string, victimId: string) => {
  const victim = await findUserById(victimId);

  sockets[currentUserId].to(gameId).emit('vote', { victim, currentUserId });
};

export const emitGameStatus = (userId: string, gameId: string, status: boolean) => {
  sockets[userId].to(gameId).emit('gameStatus', status);
};
export const emitGameStatusNewComer = (userId: string) => {
  const isStarted = true;

  sockets[userId].emit('gameStatus', isStarted);
};

export const emitGameSettings = ( userId: string, gameId: string, gameSettings: GameSettings ) => {
    sockets[userId].to(gameId).emit('gameSettings', gameSettings)
};

export const emitStartGameRound = (userId: string, gameId: string, gameRoundData: IGameRound) => {
  sockets[userId].to(gameId).emit('startGameRound', gameRoundData)
};

export const emitUpdateGameRoundData = (userId: string, gameId: string, playerCards: IObjectType | undefined) => {
  sockets[userId].to(gameId).emit('updateGameRoundData', playerCards)
}

export const emitResetGameRoundData = (gameId: string, userId: string) => {
    sockets[userId].to(gameId).emit('resetGameRoundData');
};

export const emitGetRoundStatistic = (userId: string, gameId: string, roundStatistic: IObjectType) => {
  sockets[userId].to(gameId).emit('getRoundStatistic', roundStatistic);
};

export const emitNotifyDealer = (dealerId: string, user: User) => {
  sockets[dealerId].emit('notifyDealer', user);
};

export const emitAdmitToGame = (userId: string) => {
  sockets[userId].emit('admitToGame')
};

export const emitRejectToGame = (userId: string) => {
  sockets[userId].emit('rejectToGame');
};

export const emitUpdateGameRoundStatistics = (userId: string, gameId: string, roundStatistics: IObjectType) => {
  sockets[userId].to(gameId).emit('updateGameRoundStatistics', roundStatistics);
};

