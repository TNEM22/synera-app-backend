import path from "path";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";

import userRouter from "./routes/userRoutes";
import projectRouter from "./routes/projectRoutes";

import globalErrorHandler from "./utils/globalErrorHandler";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running....!!");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);

// app.use(globalErrorHandler);

export default app;
