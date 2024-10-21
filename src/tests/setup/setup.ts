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
import { JWT_EXPIRES_IN, JWT_SECRET } from "../../config/env.config";

// Load environment variables from .env file
dotenv.config();

declare global {
  // Declare global signin function that returns a JWT token
  var signin: (Id?: string, role?: string) => Promise<string>;

  // Declare global function to create a test user
  var createTestUser: (data: UserAttr) => Promise<UserDoc>;

  // Declare global function to create a test fixture
  var createTestFixture: (data: FixtureAttr) => Promise<FixtureDoc>;

  // Declare global function to create a test team
  var createTestTeam: (data: TeamAttr) => Promise<TeamDoc>;
}

declare global {}

// Variable to hold the in-memory MongoDB server instance
let mongo: any;

beforeAll(async () => {
  // Start an in-memory MongoDB server
  mongo = new MongoMemoryServer();
  await mongo.start();

  // Get the URI of the in-memory MongoDB instance
  const mongoUri = mongo.getUri();

  // Connect to the in-memory MongoDB instance
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  // Get all MongoDB collections in the current database
  const collections = await mongoose.connection.db?.collections();

  // Clear any previous mock calls
  jest.clearAllMocks();

  // Loop through all collections and delete any existing documents
  for (let collection of collections!) {
    await collection.deleteMany();
  }
});

afterAll(async () => {
  // Stop the in-memory MongoDB server
  await mongo.stop();

  // Close the MongoDB connection
  await mongoose.connection.close();
});

// Global function to simulate user authentication and generate JWT token
global.signin = async (Id?: string, role?: string): Promise<string> => {
  // Use provided Id or generate a new one if none is passed
  let id = Id || new mongoose.Types.ObjectId().toHexString();

  // Define the JWT payload with user id, email, and role
  const payload = {
    id,
    email: "test@test.com", // Use default test email
    role,
  };

  // Sign the JWT token with secret and expiration time
  const token = jwt.sign(
    {
      id,
      email: "admin@email.com", // Admin email for testing
      role,
    },
    JWT_SECRET!, // JWT secret loaded from environment variables
    { expiresIn: JWT_EXPIRES_IN } // Token expiration time
  );

  // Store the token in Redis with a 1-day expiration
  await redisService.set(id, token, 60 * 60 * 24); // 60s * 60m * 24h = 1 day

  // Return the token as a Bearer token (useful for Authorization headers)
  return `Bearer ${token}`;
};

// Global function to create a test user in the database
global.createTestUser = async (data: UserAttr): Promise<UserDoc> => {
  // Build a new User model instance with the provided data
  const user = User.build(data);

  // Save the user document to the database
  await user.save();

  // Return the saved user document
  return user;
};

// Global function to create a test team in the database
global.createTestTeam = async (data: TeamAttr): Promise<TeamDoc> => {
  // Build a new Team model instance with the provided data
  const fixture = Team.build(data);

  // Save the team document to the database
  await fixture.save();

  // Return the saved team document
  return fixture;
};

// Global function to create a test fixture in the database
global.createTestFixture = async (data: FixtureAttr): Promise<FixtureDoc> => {
  // Build a new Fixture model instance with the provided data
  const fixture = Fixture.build(data);

  // Save the fixture document to the database
  await fixture.save();

  // Return the saved fixture document
  return fixture;
};
