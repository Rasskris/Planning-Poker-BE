import { Router } from 'express';
import { Document } from 'mongoose';
import type { Server } from 'socket.io';

export interface User extends Document {
  _id: string;
  gameId: string;
  firstName: string;
  lastName?: string;
  jobPosition?: string;
  role: string;
  avatar?: string;
  selectedCard?: {
    scoreType: string;
    scoreValue: number | 'unknown' | 'coffe';
  };
}

export interface Game extends Document {
  _id: string;
  creatorId?: string;
  isStarted?: boolean;
}

export interface Issue extends Document {
  _id: string;
  gameId: string;
  title: string;
  priority: string;
  creatorId: string;
  done?: boolean;
}

export interface Message extends Document {
  _id: string;
  gameId: string;
  text: string;
  sender: User;
}

export interface Controller {
  path: string;
  router: Router;
}

export interface Vote {
  gameId: string;
  countUsers: number;
  countVotesFor: number;
  victimId: string;
}

export interface GameSettings extends Document {
  _id: string;
  scramMasterAsPlayerSetting: boolean;
  changingCardInRoundEndSetting: boolean;
  isTimerNeededSetting: boolean;
  changeSelectionAfterFlippingCardsSetting: boolean;
  automaticFlipCardsSetting: boolean;
  scoreTypeSetting: string; //ITypesScoreCards
  scoreTypeShortSetting: string;
  gameId: string;
  timerValuesSetting: {
    minutes: number;
    seconds: number;
  };
  scoreValues: Array<number | string>;
  automaticAdmitAfterStartGame: boolean;
}

export interface IObjectType {
  [index: string]: string | null;
}

export interface IGameRound extends Document {
  _id: string;
  roundIsStarted: boolean;
  currentIssue: string;
  playerCards: IObjectType;
  gameId: string;
  roundStatistics: IObjectType;
  isActive: Boolean;
  scoreTypeValue: string;
}

export interface Timer {
  minutes: number;
  seconds: number;
  ioServer: Server;
  gameId: string;
};
