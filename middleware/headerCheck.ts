import { Request, Response, NextFunction } from 'express'

const headerCheck = (req:Request, res:Response, next:NextFunction) => {
  if (req.headers["api-key"] !== process.env.API_KEY) {
        return res.status(403).json({ msg: "Insufficient header sent" });
  }
  next();
};

export default headerCheck;

