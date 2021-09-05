import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import { errorMiddleware, loggerMiddleware } from './middleware';

class App {
  public app: express.Application;
  public port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares();
  }

  public listen() {
    this.app.listen(this.port, () => {
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
}

export default App;
