import { Router } from "express";
import {
  requireAuth,
  RestrictAccessto,
} from "../shared/middlewares/authMiddleware";
import { validateRequest, ValidationSchema } from "../shared/utils/validators";
import { FixtureController } from "../controllers/fixture.cotroller";

const router = Router();
const validator = new ValidationSchema();

router.route("/search").get(FixtureController.search);

router.use(requireAuth);
router.route("/:fixtureId").get(FixtureController.getFixture);
router.route("/").get(FixtureController.getFixtures);

router.route("/:fixtureId").delete(FixtureController.deleteFixture);

router.use(RestrictAccessto(["admin"]));

router
  .route("/create")
  .post(
    validateRequest(validator.createFixture()),
    FixtureController.createFixture
  );

router
  .route("/:fixtureId")
  .patch(
    validateRequest(validator.updateFixture()),
    FixtureController.editFixture
  );

export { router as fixtureRoutes };
