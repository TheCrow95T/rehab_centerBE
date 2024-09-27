import { Request, Response, NextFunction } from 'express'

interface ErrorWithStatus extends Error {
  status?: number;
}

const errorHandler = (err:ErrorWithStatus, req:Request, res:Response, next:NextFunction) => {
  if (err.status) {
    res.status(err.status).json({ msg: err.message });
  } else {
    res.status(500).json({ msg: err.message });
  }
};

export default errorHandler;

