import mongoose from "mongoose";

const columnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    complete_task: {
      type: Boolean, // To complete the task once the task status is changed
      default: false,
    },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title must be present."],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    columns: [columnSchema],
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
