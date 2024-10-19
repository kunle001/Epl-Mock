import { Router } from "express";
import { validateRequest, ValidationSchema } from "../shared/utils/validators";
import { UserController } from "../controllers/user.controller";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();
const validator = new ValidationSchema();

router
  .route("/signup")
  .post(validateRequest(validator.createUser()), UserController.signUp);

router
  .route("/login")
  .post(validateRequest(validator.loginUser()), UserController.signIn);

router.route("/logout").post(requireAuth, UserController.signOut);

export { router as userRoutes };
