import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions';
import { SERVER_ERROR_MESSAGE, SERVER_ERROR_STATUS_CODE } from '../constants';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  const status = error.status ?? SERVER_ERROR_STATUS_CODE;
  const message = error.message ?? SERVER_ERROR_MESSAGE;
  res
    .status(status)
    .send({ status, message });
};

export { errorMiddleware };
