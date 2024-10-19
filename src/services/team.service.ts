import { Team } from "../models/team";
import { TeamAttr, TeamDoc } from "../shared/types/team";
import AppError from "../shared/utils/appError";

export class TeamService {
  static async addTeam(data: TeamAttr) {
    const existingTeam = await Team.findOne({
      name: data.name,
    });

    if (existingTeam) {
      throw new AppError("team with the sane name already exists", 400);
    }
    const team = Team.build(data);
    return team.save();
  }

  static async updateTeam(teamId: string, data: TeamAttr) {
    // search if team name already exists
    const existingTeam = await Team.findOne({
      name: data.name,
    });

    if (existingTeam && existingTeam.id != teamId) {
      throw new AppError("This team name has been taken", 400);
    }
    const team = await Team.findById(teamId);

    team?.set({
      ...data,
    });
    return await team?.save();
  }

  static async getAllTeams(): Promise<TeamDoc[]> {
    try {
      const team = await Team.find();
      return team;
    } catch (e: any) {
      throw new AppError(e, 400);
    }
  }

  static async deleteOneTeam(teamId: string) {
    const team = await Team.findByIdAndDelete(teamId);
    if (!team) {
      throw new AppError("team not found", 404);
    }
    return;
  }

  static async getOneTeam(teamId: string): Promise<TeamDoc> {
    try {
      const team = await Team.findById(teamId);
      if (!team) {
        throw new AppError("no team with this id", 404);
      }
      return team;
    } catch (e: any) {
      throw new AppError(e, 400);
    }
  }

  static async searchTeam({
    page = "1",
    limit = "50",
    search_term,
  }: {
    page?: string;
    limit?: string;
    search_term?: string;
  }) {
    // Convert page and limit to numbers for pagination
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Calculate the number of records to skip for pagination
    const skip = (pageNumber > 0 ? pageNumber - 1 : 0) * limitNumber;

    // Build the query object
    let query: any = {};

    // Add search_term filtering if provided
    if (search_term) {
      const searchRegex = new RegExp(search_term, "i");
      query.$or = [
        { name: searchRegex },
        { stadium: searchRegex },
        { manager: searchRegex },
      ];
    }

    // Execute the query with pagination
    const teams = await Team.find(query).skip(skip).limit(limitNumber);

    return teams;
  }
}
