import { Request, Response, NextFunction, response } from 'express';
import { HttpException } from '../exceptions';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  response
    .status(status)
    .send({
      message,
      status,
    });
};

export default errorMiddleware;
