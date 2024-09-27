import { Request, Response, NextFunction } from 'express'

interface ErrorWithStatus extends Error {
    status?: number
}

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error('Not Found') as ErrorWithStatus;
  error.status = 404;
  next(error);
};

export default notFound;
