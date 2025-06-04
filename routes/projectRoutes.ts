// const express = require("express");
// const projectController = require("../controllers/projectController");
// const authController = require("../controllers/authController");
import express from "express";

import authController from "../controllers/authController";
import projectController from "../controllers/projectController";

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(projectController.getProjects)
  .post(projectController.createProject)
  .delete(projectController.deleteProject)
  .patch(projectController.updateProject);

router.get("/:id/task", projectController.getTasks);
router
  .route("/task")
  .post(projectController.createTask)
  .delete(projectController.deleteTask)
  .patch(projectController.updateTask);

router.route("/task/status").patch(projectController.changeTaskStatus);

export default router;
