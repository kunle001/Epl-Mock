import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { ConnectOptions } from "mongoose";
import jwt from "jsonwebtoken";
import { UserAttr, UserDoc } from "../../shared/types/user";
import { User } from "../../models/user";
import dotenv from "dotenv";
import { FixtureAttr, FixtureDoc } from "../../shared/types/fixtures";
import { Fixture } from "../../models/fixture";
import { TeamAttr, TeamDoc } from "../../shared/types/team";
import { Team } from "../../models/team";
import { redisService } from "../../shared/utils/redis";

dotenv.config();

declare global {
  var signin: (Id?: string, role?: string) => Promise<string>;
  var createTestUser: (data: UserAttr) => Promise<UserDoc>;
  var createTestFixture: (data: FixtureAttr) => Promise<FixtureDoc>;
  var createTestTeam: (data: TeamAttr) => Promise<TeamDoc>;
}

declare global {}

let mongo: any;

// jest.mock("../../shared/utils/redis");

beforeAll(async () => {
  process.env.JWT_SECRET = "ajwtsecret";
  process.env.JWT_EXPIRES_IN = "1d";
  mongo = new MongoMemoryServer();
  await mongo.start();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db?.collections();
  jest.clearAllMocks();

  for (let collection of collections!) {
    await collection.deleteMany();
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = async (Id?: string, role?: string): Promise<string> => {
  let id = Id || new mongoose.Types.ObjectId().toHexString();
  const payload = {
    id,
    email: "test@test.com",
    role,
  };

  const token = jwt.sign(
    {
      id,
      email: "admin@email.com",
      role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  await redisService.set(id, token, 60 * 60 * 24); // token expires in 1 day

  //  return a string thats the cookie with encoded data

  return `Bearer ${token}`;
};

global.createTestUser = async (data: UserAttr): Promise<UserDoc> => {
  const user = User.build(data);
  await user.save();
  return user;
};

global.createTestTeam = async (data: TeamAttr): Promise<TeamDoc> => {
  const fixture = Team.build(data);
  await fixture.save();
  return fixture;
};

global.createTestFixture = async (data: FixtureAttr): Promise<FixtureDoc> => {
  const fixture = Fixture.build(data);
  await fixture.save();
  return fixture;
};
