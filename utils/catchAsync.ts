import { Request, Response, NextFunction } from "express";

interface AsyncFunction {
  (req: Request, res: Response, next: NextFunction): Promise<any>;
}

const catchAsync =
  (fun: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => {
    fun(req, res, next).catch(next);
  };

export default catchAsync;
