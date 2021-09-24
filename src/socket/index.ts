import type { Socket } from "socket.io";
import { Message, Issue, User } from '../interfaces';
import { findUserById } from "../models";

const sockets: any = {};

export const onConnection = (socket: Socket) => {
  const { userId } = socket.handshake.auth;
  sockets[userId] = socket;

  socket.on('joinToRoom', async (gameId) =>  {
    const user = await findUserById(userId);

    if (user) {
      joinToRoom(socket, gameId);
      emitJoinMember(user);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`${socket.id} disconnected by: ${reason}`);
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

export const emitMessage = (userId: string, gameId: string, message: Message) => {
  sockets[userId].to(gameId).emit('message', message);
};

export const emitIssueAdd = (issue: Issue) => {
  const { creatorId, gameId } = issue;

  sockets[creatorId].to(gameId).emit('issueAdd', issue);
};

export const emitIssueUpdate = (issue: Issue) => {
  const { creatorId, gameId } = issue;

  sockets[creatorId].to(gameId).emit('issueUpdate', issue);
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
