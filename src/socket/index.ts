import type { Socket } from "socket.io";
import { Message, Issue, User, GameSettings, IGameRound } from '../interfaces';
import { findUserById } from "../models";

const sockets: any = {};

export const onConnection = (socket: Socket) => {
  const { userId } = socket.handshake.auth;
  sockets[userId] = socket;

  socket.on('joinToRoom', async ( gameId ) =>  {
    const user = await findUserById(userId);
    if (user) {
      joinToRoom(socket, gameId);
      emitJoinMember(user);
    }
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

export const emitJoinMember = (newUser: User) => {
  const {id, gameId } = newUser;

  sockets[id].to(gameId).emit('membersEdit', newUser);
};

export const emitLeaveMember = (deletedUser: User) => {
  const {id, gameId } = deletedUser;

  leaveRoom(sockets[id], gameId);
  sockets[id].to(gameId).emit('membersEdit', deletedUser);
};


export const emitMessage = (userId: string, gameId: string, message: Message) => {
  sockets[userId].to(gameId).emit('message', { message });
};

export const emitIssue = (userId: string, gameId: string, issue: Issue) => {
  sockets[userId].to(gameId).emit('issue', { issue });
};

export const emitIssueEdit = (userId: string, issue: Issue) => {
  sockets[userId].to(issue.gameId).emit('issueEdit', issue);
};

export const emitIssueRemove = (userId: string, gameId: string, issueId: string) => {
  sockets[userId].to(gameId).emit('issueDelete', { issueId });
};

export const emitVote = (userId: string, gameId: string, user: User) => {
  sockets[userId].to(gameId).emit('vote', user);
};

export const emitGameSettings = ( userId: string, gameId: string, gameSettings: GameSettings ) => {
    sockets[userId].to(gameId).emit('gameSettings', gameSettings)
}

export const emitStartGameRound = (userId: string, gameId: string, gameRoundData: IGameRound) => {
  sockets[userId].to(gameId).emit('startGameRound', gameRoundData)
}

export const emitUpdateGameRoundData = (userId: string, gameId: string, gameRoundData: IGameRound) => {
  sockets[userId].to(gameId).emit('startGameRound', gameRoundData)
}
