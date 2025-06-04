import { NextFunction, Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { promisify } from "util";

import User from "../models/userModel";

import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";

// Extend Express Request interface to include 'user'

interface RequestUser extends Request {
  user?: any;
}

const signToken = (id: string) => {
  const payload = {
    id: id,
  };
  const secretKey = process.env.JWT_SECRET ?? "";

  const jwtExpiry = process.env.JWT_EXPIRY ?? "1d";
  const options: SignOptions = {
    expiresIn: jwtExpiry as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secretKey, options);
};

const createToken = (
  user: User,
  status: number,
  req: Request,
  res: Response
) => {
  const token = signToken(user._id);
  //   console.log(process.env.COOKIE_EXPIRY);
  res.cookie("token", token, {
    expires: new Date(
      Date.now() +
        (Number(process.env.COOKIE_EXPIRY) ?? 1) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "none",
    secure: false,
  });
  // res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(status).json({
    status: "success",
    token: token,
    data: user,
  });
};

const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    // User registered successfully send the token
    createToken(newUser, 201, req, res);
  }
);

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Check for email and password
    if (!email || !password) {
      return next(new AppError("Please provide email and password!", 400));
    }

    // Try to get user
    const user: User = await User.findOne({ email: email }).select("+password");

    // Check if user exists and password is correct
    //   if (!user || !(await user.checkPassword(password))) {
    //     return next(new AppError("Invalid email and password!", 401));
    //   }
    if (!user) {
      return next(new AppError("User does not exists!", 404));
    }
    if (!user.checkPassword(password)) {
      return next(new AppError("Invalid password!", 401));
    }

    // Everything is ok send the token
    createToken(user, 200, req, res);
  }
);

const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ status: "success" });
};

const protect = catchAsync(
  async (req: RequestUser, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.token ||
      req.body?.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "error",
        data: "You are not authorized to access this route",
      });
    }

    const decoded: any = await promisify((token: any, cb: any) =>
      jwt.verify(token, process.env.JWT_SECRET ?? "1d", cb)
    )(token);
    // console.log(decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: "error",
        data: "The user belonging to this token no longer exists.",
      });
    }
    req.user = user;

    next();
  }
);

const restrictTo =
  (...roles: string[]) =>
  (req: RequestUser, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      res.status(401).json({
        status: "error",
        data: "You do not have permission to access this route.",
      });
    }
    next();
  };

export default {
  signup,
  login,
  logout,
  protect,
  restrictTo,
};
