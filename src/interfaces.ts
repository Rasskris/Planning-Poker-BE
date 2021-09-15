import { Router } from 'express';
import { Document } from 'mongoose';

export interface User extends Document {
  _id: string;
  firstName: string;
  lastName?: string;
  jobPosition?: string;
  role: string;
  avatar?: string;
  gameId: string;
}

export interface Game extends Document {
  _id: string;
  creatorId?: string;
}

export interface Issue extends Document {
  _id: string;
  title: string;
  priority: string;
  creatorId: string;
  gameId: string;
  done?: boolean;
}

export interface Message extends Document {
  _id: string;
  text: string;
  sender: User;
  gameId: string;
}

export interface Controller {
  path: string;
  router: Router;
}
