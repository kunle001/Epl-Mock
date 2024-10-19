import express from "express";
import { userRoutes } from "./user";
import { fixtureRoutes } from "./fixtures";
import { teamRoutes } from "./team";
const router = express.Router();

// Register all module routes
router.use("/users", userRoutes);
router.use("/fixture", fixtureRoutes);
router.use("/team", teamRoutes);

export { router as AllRoutes };
