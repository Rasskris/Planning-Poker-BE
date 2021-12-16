import { Router } from 'express';
import { Document } from 'mongoose';
import type { Server } from 'socket.io';
import { ROUND_STATUS } from './constants';

export interface Controller {
  path: string;
  router: Router;
}

export interface SelectedCard {
  scoreType: string;
  scoreValue: string;
}
export interface User extends Document {
  _id: string;
  gameId: string;
  firstName: string;
  lastName: string;
  jobPosition: string;
  role: string;
  selectedCard?: SelectedCard;
}

export interface Game extends Document {
  _id: string;
  creatorId?: string;
  isStarted: boolean;
}

export interface IssueStatistics {
  scoreType: string;
  scoreValue: string;
  percent: number;
}

export interface Issue extends Document {
  _id: string;
  gameId: string;
  creatorId: string;
  title: string;
  priority: string;
  statistics?: Array<IssueStatistics>,
  isDone?: boolean;
}

export interface Message extends Document {
  _id: string;
  gameId: string;
  text: string;
  sender: User;
}

export interface Vote extends Document {
  gameId: string;
  countUsersWithoutVictim: number;
  countVotesForKick: number;
  countVotesAgainstKick: number;
  victimId: string;
}

export interface Settings extends Document {
  _id: string;
  scramMasterAsPlayer: boolean;
  scoreType: string;
  scoreTypeShort: string;
  gameId: string;
  timerValues: {
    minutes: number;
    seconds: number;
  };
  scoreValues: Array<number | string>;
  automaticAdmitAfterStartGame: boolean;
}

export interface Round extends Document {
  gameId: string;
  roundStatus: ROUND_STATUS;
}

export interface Timer {
  minutes: number;
  seconds: number;
  ioServer: Server;
  gameId: string;
}