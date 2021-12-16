import type { Socket } from 'socket.io';
import { Message, Issue, User, Settings } from '../interfaces';
import { findUserById } from '../models';

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
  const { id, gameId } = user;

  sockets[id].to(gameId).emit('memberJoin', user);
};

export const emitLeaveMember = (deletedUser: User) => {
  const { id: deletedUserId, gameId } = deletedUser;

  sockets[deletedUserId].to(gameId).emit('memberLeave', deletedUserId);
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

export const emitIssueUpdate = (gameId: string, creatorId: string, issue: Issue) => {
  sockets[creatorId].to(gameId).emit('issueUpdate', issue);
};

export const emitIssueListUpdate = (gameId: string, creatorId: string, issues: Issue[]) => {
  sockets[creatorId].to(gameId).emit('issueListUpdate', issues);
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

export const emitSettingsNewComer = (userId: string, settings: Settings) => {
  sockets[userId].emit('settings', settings);
};

export const emitSettings = (userId: string, gameId: string, settings: Settings ) => {
  sockets[userId].to(gameId).emit('settings', settings);
};

export const emitStartRound = (gameId: string, userId: string) => {
  sockets[userId].to(gameId).emit('roundStart');
};

export const emitFinishRound = (gameId: string, userId: string) => {
  sockets[userId].to(gameId).emit('roundFinish');
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

export const emitResetSelectedCard = (gameId: string, userId: string, scoreType: string) => {
  sockets[userId].to(gameId).emit('resetSelectedCard', scoreType);
};
