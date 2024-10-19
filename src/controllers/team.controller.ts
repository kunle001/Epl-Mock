import { Request, Response } from "express";
import { catchAsync } from "../shared/utils/catchAsync";
import { TeamService } from "../services/team.service";
import { sendSuccess } from "../shared/response";

export class TeamController extends TeamService {
  static createTeam = catchAsync(async (req: Request, res: Response) => {
    const { name, logo, manager, stadium } = req.body;

    const team = await this.addTeam({
      name,
      logo,
      manager,
      stadium,
    });

    sendSuccess(res, 200, team, "team created");
  });

  static getTeams = catchAsync(async (req: Request, res: Response) => {
    const teams = await this.getAllTeams();

    sendSuccess(res, 200, teams);
  });

  static getTeam = catchAsync(async (req: Request, res: Response) => {
    const team = await this.getOneTeam(req.params.teamId);

    sendSuccess(res, 200, team);
  });

  static deleteTeam = catchAsync(async (req: Request, res: Response) => {
    const team = await this.deleteOneTeam(req.params.teamId);

    sendSuccess(res, 200, team);
  });

  static editTeam = catchAsync(async (req: Request, res: Response) => {
    const team = await this.updateTeam(req.params.teamId, {
      ...req.body,
    });

    sendSuccess(res, 200, team);
  });

  static searchTeams = catchAsync(async (req: Request, res: Response) => {
    const team = await this.searchTeam({
      ...req.query,
    });

    sendSuccess(res, 200, team);
  });
}
