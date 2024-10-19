import request from "supertest";
import { app } from "../app";

describe("User Service", () => {
  describe("Onboarding", () => {
    it("should throw error if necessary all fields not provided during onboarding", async () => {
      // test without confirming password
      await request(app)
        .post("/api/v1/users/signup")
        .send({
          email: "testmail@gmail.com",
          password: "test-password",
        })
        .expect(400);
    });

    it("should throw error if password is not confirmed correctly", async () => {
      // test without confirming password
      const response = await request(app)
        .post("/api/v1/users/signup")
        .send({
          email: "testmail@gmail.com",
          password: "test-password",
          confirm_password: "testword",
        })
        .expect(400);

      expect(response.body.message).toBe(
        "Password and confirm password must match"
      );
    });

    it("should throw error is email is taken", async () => {
      const email = "test-mail@gmail.com";
      // create a test user
      await global.createTestUser({
        email,
        password: "password",
        confirm_password: "password",
        name: "test name",
      });

      const response = await request(app)
        .post("/api/v1/users/signup")
        .send({
          email,
          password: "password",
          confirm_password: "password",
          name: "test name",
        })
        .expect(400);

      expect(response.body.message).toBe(
        "a user with this email already exists"
      );
    });

    it("should onboard successfully", async () => {
      await request(app)
        .post("/api/v1/users/signup")
        .send({
          email: "test1@email.com",
          password: "password",
          confirm_password: "password",
          name: "test name",
        })
        .expect(200);
    });
  });

  describe("Signing In", () => {
    it("should return error 404, if no existing user with the email is registered", async () => {
      await request(app)
        .post("/api/v1/users/login")
        .send({
          email: "test1@email.com",
          password: "password",
        })
        .expect(404);
    });

    it("should return error 400, if user password is incorrect", async () => {
      const email = "test-mail@gmail.com";
      const user = await global.createTestUser({
        email,
        password: "password",
        confirm_password: "password",
        name: "test name",
      });

      const response = await request(app)
        .post("/api/v1/users/login")
        .send({
          email,
          password: "wrong-password",
        })
        .expect(400);

      expect(response.body.message).toBe("Incorrect password");
    });

    it("should login successfully", async () => {
      const email = "test-mail@gmail.com";
      const password = "password";
      const user = await global.createTestUser({
        email,
        password,
        confirm_password: password,
        name: "test name",
      });

      const response = await request(app)
        .post("/api/v1/users/login")
        .send({
          email,
          password,
        })
        .expect(200);

      expect(response.body.data.user.name).toBe(user.name);
    });
  });

  describe("signing out", () => {
    it("should sign user out", () => {});
  });
});
