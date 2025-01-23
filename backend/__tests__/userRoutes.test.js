import { models } from "../test-utils/jest.setup.js";
import request from "supertest";
import app from "../test-utils/serverMock.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Extract models for easier usage
const { User, UserActivity } = models;

// Mock bcrypt for predictable behavior in tests
jest.mock("bcrypt", () => ({
  hash: jest.fn(async () => "$2b$10$hashedpassword"), // Mock password hash
  compare: jest.fn(async (password, hash) => password === "password"), // Mock password comparison
}));

// Mock jwt for predictable behavior in tests
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mocked-jwt-token"), // Mock token generation
  verify: jest.fn(() => ({ id: "mock-id", role: "user" })), // Mock token verification
}));

/**
 * Normalize IP address to handle "::ffff:" prefix
 * Doing it when logging
 * @param {string} ip - The IP address to normalize
 * @returns {string} - Normalized IP address
 */
function normalizeIp(ip) {
  return ip.startsWith("::ffff:") ? ip.slice(7) : ip; // Remove "::ffff:" prefix if present
}

// User Controller tests
describe("User Controller", () => {
  // Clear mocks and database before each test
  beforeEach(async () => {
    jest.clearAllMocks();
    await User.truncate({ cascade: true });
    await UserActivity.truncate({ cascade: true });
  });

  test("Register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "newuser@example.com",
        password: "password",
      })
      .set("X-Forwarded-For", "127.0.0.1"); // Simulate IP address

    // Assertions for the API response
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User registered successfully");

    // Verify the user was created in the database
    const user = await User.findOne({
      where: { email: "newuser@example.com" },
    });
    expect(user).not.toBeNull();
    expect(user.email).toBe("newuser@example.com");

    // Verify the user activity was logged
    const activity = await UserActivity.findOne({
      where: { user_id: user.id },
    });
    expect(activity).not.toBeNull();
    expect(activity.action_type).toBe("register");
    expect(normalizeIp(activity.ip_address)).toBe("127.0.0.1");
  });

  test("Fail registration for existing user email", async () => {
    // Create a user in the database
    await User.create({
      email: "test@example.com",
      password_hash: "$2b$10$hashedpassword", // Mocked hashed password
      role: "user",
    });

    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password",
    });

    // Assertions for the API response
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User already exists.");
  });

  test("Login successfully with correct credentials", async () => {
    // Create a user in the database
    const user = await User.create({
      email: "test@example.com",
      password_hash: "$2b$10$hashedpassword", // Mocked hashed password
      role: "user",
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "password",
      })
      .set("X-Forwarded-For", "127.0.0.1"); // Simulate IP address

    // Assertions for the API response
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(jwt.sign).toHaveBeenCalled(); // Verify token generation was called

    // Verify the user activity was logged
    const activity = await UserActivity.findOne({
      where: { user_id: user.id },
    });
    expect(activity).not.toBeNull();
    expect(activity.action_type).toBe("login");
    expect(activity.ip_address).toBe("127.0.0.1");
  });

  test("Fail login with incorrect credentials", async () => {
    // Create a user in the database
    await User.create({
      email: "test@example.com",
      password_hash: "$2b$10$hashedpassword", // Mocked hashed password
      role: "user",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword", // Incorrect password
    });

    // Assertions for the API response
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  test("Validate token successfully", async () => {
    const res = await request(app)
      .get("/api/auth/validate")
      .set("Authorization", "Bearer mocked-jwt-token"); // Mock token

    // Assertions for the API response
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      valid: true,
      user: { id: "mock-id", role: "user" }, // Mocked token payload
    });
  });
});
