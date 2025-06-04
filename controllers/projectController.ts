import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";

import Project from "../models/projectModel";
import Task from "../models/taskModel";
import mongoose from "mongoose";

interface RequestUser extends Request {
  user?: any;
}

const getProjects = catchAsync(
  async (req: RequestUser, res: Response, next: NextFunction) => {
    const projects = await Project.find({ userId: req.user._id });

    res.status(200).json({
      status: "success",
      data: projects,
    });
  }
);

const createProject = catchAsync(
  async (req: RequestUser, res: Response, next: NextFunction) => {
    console.log("Creating project:", req.body);
    const newProject = await Project.create({
      title: req.body.title,
      userId: req.user._id,
      columns: [
        { title: "To Do" },
        { title: "In Progress" },
        { title: "Done", complete_task: true },
      ],
    });

    res.status(201).json({
      status: "success",
      data: newProject,
    });
  }
);

const updateProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // type Columns = {
    //   _id: string;
    //   id: string;
    //   title: string;
    //   count: number;
    //   isActive: boolean;
    // };
    const projectId = req.body.id;
    const newColumns: {
      _id: string | mongoose.Types.ObjectId;
      id?: string;
      title: string;
      count?: number;
      complete_task: boolean;
      isActive?: boolean;
    }[] = req.body.columns;
    // console.log("New columns:", newColumns);

    let updatedProject = null;

    if (newColumns) {
      // Fetch the current project
      const existingProject = await Project.findById(projectId);
      if (!existingProject) {
        return res.status(404).json({
          status: "error",
          message: "Project not found",
        });
      }

      // Identify removed columns
      const oldColumns = existingProject.columns;

      const newDoneColumn = newColumns.find(
        (col: any) => col.complete_task === true
      );
      //   console.log("New Done column:", newDoneColumn);

      if (!newDoneColumn) {
        const doneColumn = oldColumns.find(
          (col: any) => col.complete_task === true
        );
        // console.log("Done column:", doneColumn);
        if (doneColumn) {
          newColumns.push({
            _id: doneColumn._id,
            title: doneColumn.title || "Done",
            complete_task: doneColumn.complete_task,
          });
        }
      }

      const newIds = newColumns.map((col: any) => col?._id?.toString());
      const oldIds = oldColumns.map((col: any) => col._id.toString());

      const removedIds = oldIds.filter((item) => {
        if (item === "done_check_task") {
          return false;
        }
        return !newIds.includes(item.toString());
      });

      // Delete tasks that had status in removed columns if any
      if (removedIds.length > 0) {
        await Task.deleteMany({
          projectId,
          status: { $in: removedIds },
        });
      }

      // Update the project with new columns
      updatedProject = await Project.findByIdAndUpdate(
        projectId,
        {
          columns: newColumns,
        },
        { new: true }
      );
    } else {
      updatedProject = await Project.findByIdAndUpdate(projectId, {
        title: req.body.title,
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedProject,
    });
  }
);

const deleteProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deletedProject = await Project.findByIdAndDelete(req.body.id);
    if (!deletedProject) {
      res.status(404).json({
        status: "error",
      });
    } else {
      // Delete all tasks related to project
      await Task.deleteMany({ projectId: req.body.id });

      res.status(204).json({
        status: "success",
      });
    }
  }
);

const getTasks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id || req.params.id === "undefined") {
      return res.status(400).json({
        status: "error",
        message: "Project ID is required",
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        status: "error",
        message: "Project not found",
      });
    }

    const tasks = await Task.find({ projectId: req.params.id });
    res.status(200).json({
      status: "success",
      data: tasks,
    });
  }
);

const createTask = catchAsync(
  async (req: RequestUser, res: Response, next: NextFunction) => {
    const newTask = await Task.create({
      projectId: req.body.projectId,
      userId: req.user._id,
      title: req.body.title,
      note: req.body.note,
      milestones: req.body.milestones,
      completedMilestones: req.body.completedMilestones,
      assignedDate: req.body.assignedDate,
      comments: req.body.comments,
      pinned: req.body.pinned,
      collaborators: req.body.collaborators,
      status: req.body.status,
    });

    res.status(201).json({
      status: "success",
      data: newTask,
    });
  }
);

const updateTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const updatedTask = await Task.findByIdAndUpdate(req.body.id, {
      title: req.body.title,
      note: req.body.note,
      milestones: req.body.milestones,
      completedMilestones: req.body.completedMilestones,
      assignedDate: req.body.assignedDate,
    });

    res.status(200).json({
      status: "success",
      data: updatedTask,
    });
  }
);

const deleteTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deletedTask = await Task.findByIdAndDelete(req.body.id);
    if (!deletedTask) {
      res.status(404).json({
        status: "error",
      });
    } else {
      res.status(204).json({
        status: "success",
      });
    }
  }
);

const changeTaskStatus = catchAsync(
  async (req: RequestUser, res: Response, next: NextFunction) => {
    const { id, status, projectId } = req.body;
    const query: { status: string; completedMilestones?: string[] } = {
      status: status,
    };

    const project = await Project.findById(projectId);
    let statusColumn = null;
    if (project) {
      statusColumn = project.columns.find(
        (col) => col._id.toString() === status
      );
    }
    if (statusColumn && statusColumn.complete_task) {
      const task = await Task.findById(id);
      if (task) query.completedMilestones = task.milestones;
    }

    await Task.findByIdAndUpdate(id, query);

    res.status(200).json({
      status: "success",
    });
  }
);

export default {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  changeTaskStatus,
};
