import mongoose from "mongoose";
import { Team } from "../models/team";
import { Fixture } from "../models/fixture";
import { User } from "../models/user";
import dotenv from "dotenv";
dotenv.config();

// Connect to MongoDB
const connectDb = async () => {
  const MONGO_URI = process.env.DB_URL!;
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB...");
};

const seedAdminUser = async () => {
  const admin = new User({
    name: "Admin User",
    email: "admin@example.com",
    password: "adminpassword123",
    role: "admin", // Admin role
  });

  await admin.save();
  console.log("Seeded admin user successfully...");
};

const seedTeams = async () => {
  const teams = [
    {
      name: "Manchester United",
      stadium: "Old Trafford",
      manager: "Ten Hag",
      logo: "team-logo",
    },
    {
      name: "Chelsea FC",
      stadium: "Stamford Bridge",
      manager: "Pochettino",
      logo: "team-logo",
    },
    {
      name: "Tottenham",
      stadium: "Tottenham Hotspur Stadium",
      manager: "Ange Postecoglou",
      logo: "team-logo",
    },
    {
      name: "Liverpool",
      stadium: "Anfield",
      manager: "Jurgen Klopp",
      logo: "team-logo",
    },
    {
      name: "Arsenal",
      stadium: "Emirates Stadium",
      manager: "Mikel Arteta",
      logo: "team-logo",
    },
    {
      name: "Manchester City",
      stadium: "Etihad Stadium",
      manager: "Pep Guardiola",
      logo: "team-logo",
    },
    {
      name: "Everton",
      stadium: "Goodison Park",
      manager: "Sean Dyche",
      logo: "team-logo",
    },
    {
      name: "Leicester City",
      stadium: "King Power Stadium",
      manager: "Brendan Rodgers",
      logo: "team-logo",
    },
    {
      name: "Leeds United",
      stadium: "Elland Road",
      manager: "Daniel Farke",
      logo: "team-logo",
    },
    {
      name: "West Ham",
      stadium: "London Stadium",
      manager: "David Moyes",
      logo: "team-logo",
    },
  ];

  await Team.insertMany(teams);
  console.log("Seeded teams successfully...");
};

const seedFixtures = async () => {
  const teams = await Team.find(); // Get all the teams from the DB

  if (teams.length < 10) {
    throw new Error("Not enough teams to create fixtures.");
  }

  const fixtures = [
    {
      homeTeam: teams[0]._id,
      awayTeam: teams[1]._id,
      date: new Date("2025-08-08T14:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[2]._id,
      awayTeam: teams[3]._id,
      date: new Date("2025-08-09T17:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[4]._id,
      awayTeam: teams[5]._id,
      date: new Date("2025-08-10T12:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[6]._id,
      awayTeam: teams[7]._id,
      date: new Date("2025-08-11T15:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[8]._id,
      awayTeam: teams[9]._id,
      date: new Date("2025-08-12T18:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[0]._id,
      awayTeam: teams[2]._id,
      date: new Date("2025-08-13T14:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[3]._id,
      awayTeam: teams[4]._id,
      date: new Date("2025-08-14T16:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[5]._id,
      awayTeam: teams[6]._id,
      date: new Date("2025-08-15T13:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[7]._id,
      awayTeam: teams[8]._id,
      date: new Date("2025-08-16T12:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[9]._id,
      awayTeam: teams[0]._id,
      date: new Date("2025-08-17T18:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[1]._id,
      awayTeam: teams[3]._id,
      date: new Date("2025-08-18T19:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[2]._id,
      awayTeam: teams[5]._id,
      date: new Date("2025-08-19T17:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[6]._id,
      awayTeam: teams[4]._id,
      date: new Date("2025-08-20T16:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[7]._id,
      awayTeam: teams[9]._id,
      date: new Date("2025-08-21T15:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[8]._id,
      awayTeam: teams[0]._id,
      date: new Date("2025-08-22T14:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[1]._id,
      awayTeam: teams[2]._id,
      date: new Date("2025-08-23T16:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[3]._id,
      awayTeam: teams[5]._id,
      date: new Date("2025-08-24T17:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[6]._id,
      awayTeam: teams[9]._id,
      date: new Date("2025-08-25T15:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[4]._id,
      awayTeam: teams[7]._id,
      date: new Date("2025-08-26T19:00:00Z"),
      status: "pending",
    },
    {
      homeTeam: teams[8]._id,
      awayTeam: teams[1]._id,
      date: new Date("2025-08-27T13:00:00Z"),
      status: "pending",
    },
  ];

  await Fixture.insertMany(fixtures);
  console.log("Seeded fixtures successfully...");
};

const seedDatabase = async () => {
  try {
    await connectDb();
    await seedAdminUser(); // Seed the admin user
    await seedTeams(); // Seed the teams
    await seedFixtures(); // Seed the fixtures
    console.log("Database seeding completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();
