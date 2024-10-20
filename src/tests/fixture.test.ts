import mongoose from "mongoose";
import { app } from "../app";
import { FixtureAttr, FixtureDoc } from "../shared/types/fixtures";
import request from "supertest";

describe("Fixture Service", () => {
  describe("Creating Fixture", () => {
    it("should throw an error if a similar fixture already exists with a message :'this fixture already exists'", async () => {
      // create a test fixture
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const data: FixtureAttr = {
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2027-08-08"),
      };

      await global.createTestFixture(data);
      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminJwtKey = await global.signin(adminId, "admin");

      const response = await request(app)
        .post("/api/v1/fixture/create")
        .set("Authorization", adminJwtKey)
        .send({
          ...data,
        })
        .expect(400);
      expect(response.body.message).toBe("this fixture already exists");
    });

    it("should throw an error if trying to create a fixture in the past with message: 'cannot create a fixture in the past'", async () => {
      // create a test feature
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const data: FixtureAttr = {
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2023-08-08"), //creating fixture in the past
      };

      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminJwtKey = await global.signin(adminId, "admin");

      const response = await request(app)
        .post("/api/v1/fixture/create")
        .set("Authorization", adminJwtKey)
        .send({
          ...data,
        })
        .expect(400);
      expect(response.body.message).toBe("cannot create a fixture in the past");
    });

    it("should fail with 403 error if logged in user does not have access to add a fixture", async () => {
      // test logic
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const userId = new mongoose.Types.ObjectId().toHexString();
      const userJwtKey = await global.signin(userId, "user");
      await request(app)
        .post("/api/v1/fixture/create")
        .set("Authorization", userJwtKey)
        .send({
          homeTeam: teamA.id,
          awayTeam: teamB.id,
          date: new Date("2023-08-08"),
        })
        .expect(403);
    });

    it("should fail with 400 statusCode if all parameters to create fields are not supplied", async () => {
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminJwtKey = await global.signin(adminId, "admin");
      await request(app)
        .post("/api/v1/fixture/create")
        .set("Authorization", adminJwtKey)
        .send({
          homeTeam: teamA.id,
          date: new Date("2025-08-08"),
        })
        .expect(400);
    });

    it("should fail if either team has a clashing fixture", async () => {
      // Create teams
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old Trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochettino",
        logo: "team-logo",
      });

      const teamC = await global.createTestTeam({
        name: "Tottenham",
        stadium: "Tottenham Hotspur Stadium",
        manager: "Pochettino",
        logo: "team-logo",
      });

      // Admin authorization setup
      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminJwtKey = await global.signin(adminId, "admin");

      // Create the first fixture (teamA vs teamB on August 8th, 2025)
      await global.createTestFixture({
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2025-08-08T14:00:00Z"), // August 8th, 2025 at 2:00 PM
      });

      // Try to create a second fixture where teamB plays within 24 hours (teamC vs teamB)
      const response = await request(app)
        .post("/api/v1/fixture/create")
        .set("Authorization", adminJwtKey)
        .send({
          homeTeam: teamC.id,
          awayTeam: teamB.id,
          date: new Date("2025-08-09T10:00:00Z"), // August 9th, 2025 at 10:00 AM (within 24 hours)
        })
        .expect(400); // Expect failure due to clashing fixture

      // Optional: Check the response message
      expect(response.body.message).toBe(
        "One of the teams has a match within 24 hours of this fixture"
      );
    });

    it("should successfully add a fixture if all data is valid", async () => {
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminJwtKey = await global.signin(adminId, "admin");
      await request(app)
        .post("/api/v1/fixture/create")
        .set("Authorization", adminJwtKey)
        .send({
          homeTeam: teamA.id,
          awayTeam: teamB.id,
          date: new Date("2025-08-08"),
        })
        .expect(200);
    });
  });

  describe("updating Fixture", () => {
    it("should throw an error 404 if the fixture is not found", async () => {
      // test logic
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const adminId = new mongoose.Types.ObjectId().toHexString();
      const wrongId = new mongoose.Types.ObjectId().toHexString();
      const adminJwtKey = await global.signin(adminId, "admin");
      const response = await request(app)
        .patch(`/api/v1/fixture/${wrongId}`)
        .set("Authorization", adminJwtKey)
        .send({
          homeTeam: teamA.id,
          awayTeam: teamB.id,
          date: new Date("2025-08-08"),
        })
        .expect(404);

      expect(response.body.message).toBe("fixture not found");
    });

    it("should throw an error if trying to update scores before the game has started", async () => {
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const data: FixtureAttr = {
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2027-08-08"),
      };

      const fixture = await global.createTestFixture(data);

      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminJwtKey = await global.signin(adminId, "admin");
      const response = await request(app)
        .patch(`/api/v1/fixture/${fixture.id}`)
        .set("Authorization", adminJwtKey)
        .send({
          score: {
            home: 0,
            away: 2,
          },
        })
        .expect(400);
      //   console.log(response.body);
      expect(response.body.message).toBe(
        "Game has not started, you cannot update scores yet or set as completed"
      );
    });

    it("should throw an error if trying to update status of game to completed before the game starts", async () => {
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const data: FixtureAttr = {
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2027-08-08"),
      };

      const fixture = await global.createTestFixture(data);

      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminJwtKey = await global.signin(adminId, "admin");
      const response = await request(app)
        .patch(`/api/v1/fixture/${fixture.id}`)
        .set("Authorization", adminJwtKey)
        .send({
          status: "completed",
        })
        .expect(400);
      //   console.log(response.body);
      expect(response.body.message).toBe(
        "Game has not started, you cannot update scores yet or set as completed"
      );
    });

    it("should successfully update the fixture date if the data is valid and game has started", async () => {
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const data: FixtureAttr = {
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2027-08-08"),
      };

      const fixture = await global.createTestFixture(data);

      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminJwtKey = await global.signin(adminId, "admin");
      const newDate = new Date("2024-04-08");
      const response = await request(app)
        .patch(`/api/v1/fixture/${fixture.id}`)
        .set("Authorization", adminJwtKey)
        .send({
          date: newDate,
        })
        .expect(200);
      const responseDate = response.body.data.date;
      expect(new Date(responseDate)).toEqual(newDate);
    });
  });

  describe("Get All Fixtures", () => {
    it("should return all fixtures successfully", async () => {
      const userId = new mongoose.Types.ObjectId().toHexString();
      const userJwtKey = await global.signin(userId, "admin");
      const response = await request(app)
        .get("/api/v1/fixture")
        .set("Authorization", userJwtKey)
        .expect(200);
    });

    it("should return 401, if user is not logged in", async () => {
      await request(app).get("/api/v1/fixture").expect(401);
    });
  });

  describe("delete Single Fixture", () => {
    it("should throw an error if the fixture to delete is not found", async () => {
      // test logic
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const adminId = new mongoose.Types.ObjectId().toHexString();
      const wrongId = new mongoose.Types.ObjectId().toHexString();
      const adminJwtKey = await global.signin(adminId, "admin");
      const response = await request(app)
        .delete(`/api/v1/fixture/${wrongId}`)
        .set("Authorization", adminJwtKey)
        .expect(404);

      expect(response.body.message).toBe("fixture not found");
    });

    it("should successfully delete a fixture if it exists", async () => {
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const data: FixtureAttr = {
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2027-08-08"),
      };

      const fixture = await global.createTestFixture(data);

      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminJwtKey = await global.signin(adminId, "admin");
      const newDate = new Date("2024-04-08");
      const response = await request(app)
        .delete(`/api/v1/fixture/${fixture.id}`)
        .set("Authorization", adminJwtKey)
        .expect(200);
      expect(response.body.message).toBe("fixture deleted");
    });
  });

  describe("get One Fixture", () => {
    it("should throw an error if the fixture is not found", async () => {
      const userId = new mongoose.Types.ObjectId().toHexString();
      const wrongFixtureId = new mongoose.Types.ObjectId().toHexString();
      const userJwt = await global.signin(userId, "admin");
      const response = await request(app)
        .get(`/api/v1/fixture/${wrongFixtureId}`)
        .set("Authorization", userJwt)
        .expect(404);
      expect(response.body.message).toBe("fixture not found");
    });

    it("should successfully return a fixture if it exists", async () => {
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const data: FixtureAttr = {
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2027-08-08"),
      };

      const fixture = await global.createTestFixture(data);

      const userId = new mongoose.Types.ObjectId().toHexString();
      const userJwt = await global.signin(userId, "admin");
      const response = await request(app)
        .get(`/api/v1/fixture/${fixture.id}`)
        .set("Authorization", userJwt)
        .expect(200);
    });
  });

  describe("search fixture", () => {
    it("can search a team fixture history, by team name", async () => {
      // creating test fixtures
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const teamC = await global.createTestTeam({
        name: "Astin Villa FC",
        stadium: "Villa Park",
        manager: "Pellegrini",
        logo: "villa logo",
      });

      //   create test fixture between teamA and c
      await global.createTestFixture({
        homeTeam: teamA.id,
        awayTeam: teamC.id,
        date: new Date("2024-11-11"),
      });

      //   create test fixture between teamA and teamB
      await global.createTestFixture({
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2027-12-08"),
      });

      //   search for team A fixtures
      const response1 = await request(app)
        .get(`/api/v1/fixture/search?team_name=${teamA.name}`)
        .expect(200);
      //   expect to return 2 results for teamA fixtures
      expect(response1.body.data.length).toBe(2);

      //   search for team B fixtures
      const response2 = await request(app)
        .get(`/api/v1/fixture/search?team_name=${teamB.name}`)
        .expect(200);
      //   expect to return 1 result for teamB fixtures
      expect(response2.body.data.length).toBe(1);

      //   search for team C fixtures
      const response3 = await request(app)
        .get(`/api/v1/fixture/search?team_name=${teamC.name}`)
        .expect(200);
      //   expect to return 1 result for teamB fixtures
      expect(response3.body.data.length).toBe(1);
    });

    it("can search a team fixture history and filter by date, by team name and date range", async () => {
      // creating test fixtures
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const teamC = await global.createTestTeam({
        name: "Astin Villa FC",
        stadium: "Villa Park",
        manager: "Pellegrini",
        logo: "villa logo",
      });

      //   create test fixture to November 2024
      await global.createTestFixture({
        homeTeam: teamA.id,
        awayTeam: teamC.id,
        date: new Date("2024-11-11"),
      });

      //    create test fixture to December 2027
      await global.createTestFixture({
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2027-12-08"),
      });

      //   create test fixture to December 2024
      await global.createTestFixture({
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2024-12-08"),
      });

      const from_date = "2024-01-01";
      const to_date = "2024-12-31";
      const search1 = await request(app)
        .get(
          `/api/v1/fixture/search?from_date=${from_date}&to_date=${to_date}&team_name=${teamA.name}`
        )
        .expect(200); //search teamA fixtures between January 2024 to December 2024
      expect(search1.body.data.length).toBe(2); //expect results to be 2

      const from_date2 = "2027-01-01";
      const to_date2 = "2027-12-31";
      const search2 = await request(app)
        .get(
          `/api/v1/fixture/search?from_date=${from_date2}&to_date=${to_date2}&team_name=${teamA.name}`
        )
        .expect(200); //search teamA fixtures between January 2027 to December 2027
      expect(search2.body.data.length).toBe(1); //expect results to be 1
    });

    it("can search  fixture history and filter by date", async () => {
      // creating test fixtures
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const teamC = await global.createTestTeam({
        name: "Astin Villa FC",
        stadium: "Villa Park",
        manager: "Pellegrini",
        logo: "villa logo",
      });

      const teamD = await global.createTestTeam({
        name: "Brighton",
        stadium: "Brighton Park",
        manager: "Fergie",
        logo: "brighton logo",
      });

      //   create test fixture to November 2024
      await global.createTestFixture({
        homeTeam: teamA.id,
        awayTeam: teamC.id,
        date: new Date("2024-11-11"),
      });

      await global.createTestFixture({
        homeTeam: teamB.id,
        awayTeam: teamD.id,
        date: new Date("2024-11-11"),
      });

      //    create test fixture to December 2027
      await global.createTestFixture({
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2027-12-08"),
      });

      //    create test fixture to December 2027
      await global.createTestFixture({
        homeTeam: teamC.id,
        awayTeam: teamD.id,
        date: new Date("2027-04-08"),
      });

      //   create test fixture to December 2024
      await global.createTestFixture({
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2024-12-08"),
      });

      const from_date = "2024-01-01";
      const to_date = "2024-12-31";
      const search1 = await request(app)
        .get(`/api/v1/fixture/search?from_date=${from_date}&to_date=${to_date}`)
        .expect(200); //search fixtures between January 2024 to December 2024
      expect(search1.body.data.length).toBe(3); //expect results to be 2

      const from_date2 = "2027-01-01";
      const to_date2 = "2027-12-31";
      const search2 = await request(app)
        .get(
          `/api/v1/fixture/search?from_date=${from_date2}&to_date=${to_date2}`
        )
        .expect(200); //searchfixtures between January 2027 to December 2027
      expect(search2.body.data.length).toBe(2); //expect results to be 2
    });

    it("can search  fixture history, and paginate", async () => {
      // creating test fixtures
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const teamC = await global.createTestTeam({
        name: "Astin Villa FC",
        stadium: "Villa Park",
        manager: "Pellegrini",
        logo: "villa logo",
      });

      const teamD = await global.createTestTeam({
        name: "Brighton",
        stadium: "Brighton Park",
        manager: "Fergie",
        logo: "brighton logo",
      });

      //   create test fixture to November 2024
      await global.createTestFixture({
        homeTeam: teamA.id,
        awayTeam: teamC.id,
        date: new Date("2024-11-11"),
      });

      await global.createTestFixture({
        homeTeam: teamB.id,
        awayTeam: teamD.id,
        date: new Date("2024-11-11"),
      });

      //    create test fixture to December 2027
      await global.createTestFixture({
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2027-12-08"),
      });

      //    create test fixture to December 2027
      await global.createTestFixture({
        homeTeam: teamC.id,
        awayTeam: teamD.id,
        date: new Date("2027-04-08"),
      });

      //   create test fixture to December 2024
      await global.createTestFixture({
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2024-12-08"),
      });

      const limit = 3;

      const search1 = await request(app)
        .get(`/api/v1/fixture/search?page=1&limit=${limit}`)
        .expect(200); //filter 3 results
      expect(search1.body.data.length).toBe(3);

      const limit2 = 4;
      const search2 = await request(app)
        .get(`/api/v1/fixture/search?page=1&limit=${limit2}`)
        .expect(200); //filter 4 results
      expect(search2.body.data.length).toBe(4);
    });

    it("can search  fixture history by status, either pending, completed, or started.", async () => {
      // creating test fixtures
      const teamA = await global.createTestTeam({
        name: "Manchester United",
        stadium: "Old trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea FC",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      await global.createTestFixture({
        homeTeam: teamA.id,
        awayTeam: teamB.id,
        date: new Date("2027-12-08"),
      });

      //   search pending fixtures
      const search_pending = await request(app)
        .get(`/api/v1/fixture/search?page=1&status=pending`)
        .expect(200);
      expect(search_pending.body.data.length).toBe(1);

      //   search completed fixtures
      const search_completed = await request(app)
        .get(`/api/v1/fixture/search?page=1&status=completed`)
        .expect(200);
      expect(search_completed.body.data.length).toBe(0);

      //   search started fixtures
      const search_started = await request(app)
        .get(`/api/v1/fixture/search?page=1&status=completed`)
        .expect(200);
      expect(search_started.body.data.length).toBe(0);
    });
  });
});
