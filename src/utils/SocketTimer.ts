import type { Server } from 'socket.io';
import { Timer } from '../interfaces';

export class SocketTimer {
  minutes: number;
  seconds: number;
  timerId: NodeJS.Timeout | null =  null;
  ioServer: Server;
  gameId: string;

  constructor({ minutes, seconds, ioServer, gameId }: Timer) {
    this.minutes = minutes;
    this.seconds = seconds;
    this.ioServer = ioServer;
    this.gameId = gameId;
  }

  public startCountdown(): void {
    this.emitTimer();
    this.timerId = setInterval(() => this.emitTimer(), 1000);
  }

  public clearTimer(): void {
    this.minutes = 0;
    this.seconds = 0;

    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  private emitTimer(): void {  
    if (this.minutes === 0 && this.seconds === 0) {
      this.clearTimer();

    //   this.ioServer.to(this.gameId).emit('roundStatus', ROUND_STATUS.FINISHED);
    } else if (this.seconds === 0) {
      this.minutes -= 1;
      this.seconds = 59;
    }

    const timer = {
      minutes: this.minutes,
      seconds: this.seconds,
    };

    this.ioServer.to(this.gameId).emit('timer', (timer)); //TO DO: change

    this.seconds -= 1;
  } 
} 