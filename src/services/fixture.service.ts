import { Fixture } from "../models/fixture";
import { Team } from "../models/team";
import {
  FixtureAttr,
  FixtureDoc,
  UpdateFixtureAttr,
} from "../shared/types/fixtures";
import AppError from "../shared/utils/appError";

export class FixtureService {
  static async addFixture(data: FixtureAttr) {
    //  check if similar fixture already exists for that day
    const existingFixture = await Fixture.findOne(data);
    if (existingFixture) {
      throw new AppError("this fixture already exists", 400);
    }

    // check that fixture time has not passed
    if (new Date(data.date).getTime() < Date.now()) {
      throw new AppError("cannot create a fixture in the past", 400);
    }

    // Check if either team has a match within 24 hours of the fixture date
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const startOfWindow = new Date(new Date(data.date).getTime() - oneDay);
    const endOfWindow = new Date(new Date(data.date).getTime() + oneDay);

    const conflictingFixture = await Fixture.findOne({
      $or: [
        { homeTeam: data.homeTeam },
        { awayTeam: data.awayTeam },
        { homeTeam: data.awayTeam }, // Checks if the away team is the home team in another fixture
        { awayTeam: data.homeTeam }, // Checks if the home team is the away team in another fixture
      ],
      date: {
        $gte: startOfWindow,
        $lte: endOfWindow,
      },
    });

    if (conflictingFixture) {
      throw new AppError(
        "One of the teams has a match within 24 hours of this fixture",
        400
      );
    }

    const fixture = Fixture.build(data);
    return fixture.save();
  }

  static async updateFixture(id: string, data: UpdateFixtureAttr) {
    // Check if the game has started before updating the score
    const fixture = await Fixture.findById(id);
    if (!fixture) {
      throw new AppError("fixture not found", 404);
    }
    if (data.score && new Date(fixture.date).getTime() > Date.now()) {
      throw new AppError(
        "Game has not started, you cannot update scores yet",
        400
      );
    }

    fixture.set({ ...data });
    await fixture.save();
    return fixture;
  }

  static async getAllFixtures(): Promise<FixtureDoc[]> {
    try {
      const fixture = await Fixture.find();
      return fixture;
    } catch (e: any) {
      throw new AppError(e, 400);
    }
  }

  static async deleteOneFixture(FixtureId: string) {
    const fixture = await Fixture.findByIdAndDelete(FixtureId);
    if (!fixture) {
      throw new AppError("fixture not found", 404);
    }
    return;
  }

  static async getOneFixture(fixtureId: string): Promise<FixtureDoc> {
    const fixture = await Fixture.findById(fixtureId);
    if (!fixture) {
      throw new AppError("fixture not found", 404);
    }
    return fixture;
  }

  static async searchFixture({
    page = "1",
    limit = "50",
    from_date,
    to_date,
    status,
    team_name,
  }: {
    page?: string;
    limit?: string;
    from_date?: string;
    to_date?: string;
    status?: string;
    team_name?: string;
  }) {
    // Convert date strings to Date objects, or set default values
    let fromDate = from_date
      ? new Date(from_date)
      : new Date(
          new Date().getFullYear() - 5,
          new Date().getMonth(),
          new Date().getDate()
        );

    let toDate = to_date
      ? new Date(to_date)
      : new Date(
          new Date().getFullYear() + 5,
          new Date().getMonth(),
          new Date().getDate()
        );
    // Convert page and limit to numbers for pagination
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Calculate the number of records to skip for pagination
    const skip = (pageNumber > 0 ? pageNumber - 1 : 0) * limitNumber;

    // Build the query object with date range
    let query: any = {
      date: {
        $gte: fromDate,
        $lte: toDate,
      },
    };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by team name (home or away) if provided
    if (team_name) {
      const searchRegex = new RegExp(team_name, "i");

      // Query for teams matching the team name
      const teams = await Team.find({
        $or: [
          { name: searchRegex },
          { stadium: searchRegex },
          { manager: searchRegex },
        ],
      });

      // If no teams are found, return an empty array
      if (teams.length === 0) {
        return [];
      }

      // Get all team IDs that match the search
      const teamIds = teams.map((team) => team._id);
      // Add to the query to match fixtures with those teams
      query.$or = [
        { homeTeam: { $in: teamIds } },
        { awayTeam: { $in: teamIds } },
      ];
    }

    // Execute the query with pagination, populate team names, and filter by criteria
    const fixtures = await Fixture.find(query)
      .populate("homeTeam awayTeam", "name")
      .skip(skip)
      .limit(limitNumber);

    return fixtures;
  }
}
