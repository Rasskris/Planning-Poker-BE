import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { json, urlencoded } from 'body-parser';
import mongoose from 'mongoose';
import { errorMiddleware, loggerMiddleware } from './middleware';
import { onConnection } from './socket';
import { UserController, GameController, MessageController, IssueController, VoteController, GameSettingsController, GameRoundController } from './controllers';

class App {
  public app: express.Application;
  public port: number;
  public server: HttpServer;
  public ioServer: Server;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.server = createServer(this.app);
    this.ioServer = new Server(this.server);

    this.initializeMiddlewares();
    this.initializeMongoDB();
    this.initializeSocketConnection();
    this.initializeControllers();
  }

  public listen() {
    this.server.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    })
  }

  private initializeMiddlewares() {
    this.app
      .use(json({ limit: '50mb' }))
      .use(urlencoded({ limit: '50mb', extended: true }))
      .use(cors())
      .use(errorMiddleware)
      .use(loggerMiddleware);
  }

  private initializeMongoDB() {
    const { MONGO_USER, MONGO_PASSWORD, MONGO_URL } = process.env;

    mongoose.Promise = global.Promise;
    mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_URL}`);
    mongoose.set('toJSON', {
      virtuals: true,
    });
  }

  private initializeControllers() {
    const controllers = [
      new GameController(),
      new UserController(),
      new MessageController(),
      new IssueController(),
      new VoteController(),
      new GameSettingsController(),
      new GameRoundController(),
    ];

    controllers.forEach((controller) => {
      this.app.use('/api', controller.router);
    });
  }

  public initializeSocketConnection() {
    this.ioServer.on('connection', onConnection);
    this.app.set("socketio", this.ioServer);
  }
}

export { App };
