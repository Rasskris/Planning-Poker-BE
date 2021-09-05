import { Request, Response, NextFunction, response } from 'express';
import { HttpException } from '../exceptions';
import { DEFAULT_ERR_MESSAGE, DEFAULT_STATUS_CODE } from '../constants';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || DEFAULT_STATUS_CODE;
  const message = error.message || DEFAULT_ERR_MESSAGE;
  response
    .status(status)
    .send({
      message,
      status,
    });
};

export { errorMiddleware };
