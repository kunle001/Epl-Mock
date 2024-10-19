import { Request, Response } from "express";
import { catchAsync } from "../shared/utils/catchAsync";
import { FixtureService } from "../services/fixture.service";
import { sendSuccess } from "../shared/response";

export class FixtureController extends FixtureService {
  static createFixture = catchAsync(async (req: Request, res: Response) => {
    const { homeTeam, awayTeam, date } = req.body;

    const fixture = await this.addFixture({
      homeTeam,
      awayTeam,
      date,
    });

    sendSuccess(res, 200, fixture, "fixture created");
  });

  static editFixture = catchAsync(async (req: Request, res: Response) => {
    const fixture = await this.updateFixture(req.params.fixtureId, {
      ...req.body,
    });

    sendSuccess(res, 200, fixture, "fixture edited");
  });

  static getFixtures = catchAsync(async (req: Request, res: Response) => {
    const fixtures = await this.getAllFixtures();

    sendSuccess(res, 200, fixtures);
  });

  static getFixture = catchAsync(async (req: Request, res: Response) => {
    const fixtures = await this.getOneFixture(req.params.fixtureId);

    sendSuccess(res, 200, fixtures);
  });

  static deleteFixture = catchAsync(async (req: Request, res: Response) => {
    const fixtures = await this.deleteOneFixture(req.params.fixtureId);

    sendSuccess(res, 200, fixtures, "fixture deleted");
  });

  static search = catchAsync(async (req: Request, res: Response) => {
    const fixtures = await this.searchFixture({
      ...req.query,
    });

    sendSuccess(res, 200, fixtures);
  });
}
