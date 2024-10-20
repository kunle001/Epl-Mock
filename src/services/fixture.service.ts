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

  static async updateFixture(
    id: string,
    data: UpdateFixtureAttr
  ): Promise<FixtureDoc> {
    // Check if the game has started before updating the score
    const fixture = await Fixture.findById(id);
    if (!fixture) {
      throw new AppError("fixture not found", 404);
    }

    // Check if score or status update is valid based on the fixture's date
    const hasInvalidScoreUpdate =
      data.score && new Date(fixture.date).getTime() > Date.now();
    const isInvalidCompletion =
      data.status === "completed" &&
      new Date(fixture.date).getTime() > Date.now();

    if (hasInvalidScoreUpdate || isInvalidCompletion) {
      throw new AppError(
        "Game has not started, you cannot update scores yet or set as completed",
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
  }): Promise<FixtureDoc[]> {
    const now = new Date();

    // Parse and validate date ranges with defaults if missing
    const fromDate = from_date
      ? new Date(from_date)
      : new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    const toDate = to_date
      ? new Date(to_date)
      : new Date(now.getFullYear() + 5, now.getMonth(), now.getDate());

    // Validate if fromDate and toDate are valid Date objects
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new AppError("Invalid date format", 400);
    }

    // Validate and parse pagination details
    const pageNumber = Math.max(parseInt(page, 10), 1); // Ensure a minimum of page 1
    const limitNumber = Math.max(parseInt(limit, 10), 1); // Ensure at least 1 item per page
    const skip = (pageNumber - 1) * limitNumber;

    // Construct the base query with the date range
    const query: Record<string, any> = {
      date: {
        $gte: fromDate,
        $lte: toDate,
      },
    };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // If team_name is provided, build a team search query
    if (team_name) {
      const searchRegex = new RegExp(team_name, "i");

      // Find matching teams by name, stadium, or manager
      const teams = await Team.find({
        $or: [
          { name: searchRegex },
          { stadium: searchRegex },
          { manager: searchRegex },
        ],
      }).select("_id");

      // If no teams match, return early with an empty result
      if (!teams.length) return [];

      // Extract team IDs and apply them to the fixture query
      const teamIds = teams.map((team) => team._id);
      query.$or = [
        { homeTeam: { $in: teamIds } },
        { awayTeam: { $in: teamIds } },
      ];
    }

    // Fetch and paginate the fixtures, populating team details
    const fixtures = await Fixture.find(query)
      .populate("homeTeam awayTeam", "name")
      .skip(skip)
      .limit(limitNumber);

    return fixtures;
  }
}
