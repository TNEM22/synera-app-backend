import app from "./app";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

const DB: string = (process.env.DATABASE ?? "").replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD ?? ""
);

mongoose.connect(DB).then(() => console.log("DB connected!"));

const port: number = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}....`);
});
