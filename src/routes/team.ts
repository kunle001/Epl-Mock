import { Router } from "express";
import {
  requireAuth,
  RestrictAccessto,
} from "../shared/middlewares/authMiddleware";
import { validateRequest, ValidationSchema } from "../shared/utils/validators";
import { TeamController } from "../controllers/team.controller";

const router = Router();
const validator = new ValidationSchema();

router.route("/search").get(TeamController.searchTeams);
router.use(requireAuth);

router.route("/:teamId").get(TeamController.getTeam);

router.route("/").get(TeamController.getTeams);

router.use(RestrictAccessto(["admin"]));

router.route("/:teamId").delete(TeamController.deleteTeam);
router
  .route("/create")
  .post(validateRequest(validator.createTeam()), TeamController.createTeam);

router
  .route("/:teamId")
  .patch(validateRequest(validator.updateTeam()), TeamController.editTeam);

export { router as teamRoutes };
