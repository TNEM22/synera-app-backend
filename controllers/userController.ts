// const User = require("../models/userModel");
// const catchAsync = require("../utils/catchAsync");
import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";

import User from "../models/userModel";

interface RequestUser extends Request {
  user?: any;
}

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const Users = await User.find();

    res.status(200).json({
      status: "success",
      results: Users.length,
      data: Users,
    });
  }
);

const getMe = catchAsync(
  async (req: RequestUser, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id).select(
      "-password -active -__v -createdAt -updatedAt -_id"
    );

    res.status(200).json({
      status: "success",
      data: user,
    });
  }
);

export default {
  getAllUsers,
  getMe,
};
