import mongoose from "mongoose";
import { app } from "../app";
import AppError from "../shared/utils/appError";
import request from "supertest";

describe("TeamService", () => {
  describe("Add Team", () => {
    // Test case: Should throw an error if team data is incomplete/invalid (e.g., missing manager field)
    it("should throw an error if team data is invalid", async () => {
      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminKey = await global.signin(adminId, "admin");
      const response = await request(app)
        .post("/api/v1/team/create")
        .set("Authorization", adminKey)
        .send({
          name: "Test Team",
          logo: "team-logo",
          stadium: "test-stadium",
          // omit manager
        })
        .expect(400);

      expect(response.body.message).toBe('"manager" is required');
    });

    it("throw error if team name already exists", async () => {
      const name = "Test Team";
      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminKey = await global.signin(adminId, "admin");
      await global.createTestTeam({
        name,
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });
      const response = await request(app)
        .post("/api/v1/team/create")
        .set("Authorization", adminKey)
        .send({
          name,
          logo: "team-logo",
          stadium: "test-stadium",
          manager: "test-manager",
        })
        .expect(400);

      expect(response.body.message).toBe(
        "team with the sane name already exists"
      );
    });
    it("throw 403 if user trying to create team is not an admin", async () => {
      const response = await request(app)
        .post("/api/v1/team/create")
        .set("Authorization", await global.signin())
        .send({
          name: "Test Name",
          logo: "team-logo",
          stadium: "test-stadium",
          manager: "test-manager",
        })
        .expect(403);
    });

    it("should add a new team successfully", async () => {
      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminKey = await global.signin(adminId, "admin");
      await request(app)
        .post("/api/v1/team/create")
        .set("Authorization", adminKey)
        .send({
          name: "Test name",
          logo: "team-logo",
          stadium: "test-stadium",
          manager: "test-manager",
        })
        .expect(200);
    });
  });

  describe("Update Team", () => {
    it("should update an existing team successfully", async () => {
      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminKey = await global.signin(adminId, "admin");
      const team = await global.createTestTeam({
        name: "Test Team",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const newTeamName = "updated team name";
      const response = await request(app)
        .patch(`/api/v1/team/${team.id}`)
        .set("Authorization", adminKey)
        .send({
          name: newTeamName,
        })
        .expect(200);

      expect(response.body.data.name).toBe(newTeamName);
    });

    it("should throw an error if team name already exists", async () => {
      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminKey = await global.signin(adminId, "admin");
      const name = "Test Team";
      await global.createTestTeam({
        name,
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const team = await global.createTestTeam({
        name: "Team B",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const response = await request(app)
        .patch(`/api/v1/team/${team.id}`)
        .set("Authorization", adminKey)
        .send({
          name,
        })
        .expect(400);
      expect(response.body.message).toBe("This team name has been taken");
    });
    it("throw 403 if user trying to update team is not an admin", async () => {
      const userKey = await global.signin();
      const name = "Team B";
      const team = await global.createTestTeam({
        name,
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });
      await request(app)
        .patch(`/api/v1/team/${team.id}`)
        .set("Authorization", userKey)
        .send({
          name,
        })
        .expect(403);
    });
  });

  describe("get All Teams", () => {
    it("should return 401 if user is not login", async () => {
      await request(app).get("/api/v1/team").expect(401);
    });

    it("should return an array of lenght 1", async () => {
      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminKey = await global.signin(adminId, "admin");

      await global.createTestTeam({
        name: "Test Team",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });
      const response = await request(app)
        .get("/api/v1/team")
        .set("Authorization", adminKey)
        .expect(200);

      expect(response.body.data.length).toBe(1);
    });

    it("should return an empty array if no team exists", async () => {
      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminKey = await global.signin(adminId, "admin");

      const response = await request(app)
        .get("/api/v1/team")
        .set("Authorization", adminKey)
        .expect(200);

      expect(response.body.data.length).toBe(0);
    });
  });

  describe("deleteOneTeam", () => {
    it("should fail with 404 if team does not exist", async () => {
      const adminId = new mongoose.Types.ObjectId().toHexString();
      const wrongId = new mongoose.Types.ObjectId().toHexString();
      const adminKey = await global.signin(adminId, "admin");

      const response = await request(app)
        .delete(`/api/v1/team/${wrongId}`)
        .set("Authorization", adminKey)
        .expect(404);
      expect(response.body.message).toBe("team not found");
    });

    it("should delete a team successfully", async () => {
      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminKey = await global.signin(adminId, "admin");

      const team = await global.createTestTeam({
        name: "Test Team",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });
      await request(app)
        .delete(`/api/v1/team/${team.id}`)
        .set("Authorization", adminKey)
        .expect(200);
    });
  });

  describe("getOneTeam", () => {
    it("should return a team by ID", async () => {
      const adminId = new mongoose.Types.ObjectId().toHexString();
      const adminKey = await global.signin(adminId, "admin");

      const team = await global.createTestTeam({
        name: "Test Team",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });
      await request(app)
        .get(`/api/v1/team/${team.id}`)
        .set("Authorization", adminKey)
        .expect(200);
    });

    it("should throw an error if the team is not found", async () => {
      const adminId = new mongoose.Types.ObjectId().toHexString();
      const wrongId = new mongoose.Types.ObjectId().toHexString();
      const adminKey = await global.signin(adminId, "admin");

      await request(app)
        .delete(`/api/v1/team/${wrongId}`)
        .set("Authorization", adminKey)
        .expect(404);
    });
  });

  describe("searchTeam", () => {
    it("should return teams matching the search criteria", async () => {
      const teamA = await global.createTestTeam({
        name: "Manchester ",
        stadium: "Old Trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      const teamB = await global.createTestTeam({
        name: "Chelsea ",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const response = await request(app)
        .get("/api/v1/team/search?search_term=Ten") //search team by manager name
        .expect(200);

      expect(response.body.data[0]._id).toBe(teamA.id);
    });

    it("search by managers name ", async () => {
      const teamA = await global.createTestTeam({
        name: "Manchester ",
        stadium: "Old Trafford",
        manager: "Ten Hag",
        logo: "team-logo",
      });

      await global.createTestTeam({
        name: "Chelsea ",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const search_term = "Ten";
      const response = await request(app)
        .get(`/api/v1/team/search?search_term=${search_term}`) //search team by manager name
        .expect(200);

      expect(response.body.data[0]._id).toBe(teamA.id);
    });

    it("can seacrh by stadium name", async () => {
      const team = await global.createTestTeam({
        name: "Chelsea ",
        stadium: "Stamford Bridge",
        manager: "Pochetino",
        logo: "team-logo",
      });

      const search_term = "stamford";
      const response = await request(app)
        .get(`/api/v1/team/search?search_term=${search_term}`) //search team by manager name
        .expect(200);

      expect(response.body.data[0]._id).toBe(team.id);
    });

    it("should return an empty array if no teams match", async () => {
      const response = await request(app)
        .get("/api/v1/team/search?search_term=Ten") //search team by manager name
        .expect(200);

      expect(response.body.data.length).toBe(0);
    });
  });
});
