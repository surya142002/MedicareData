import jwt from "jsonwebtoken";
import { verifyToken, isAdmin } from "../middleware/userMiddleware.js";
import express from "express";
import request from "supertest";

// Mock the JWT secret environment variable for tests
process.env.JWT_SECRET = "test-secret";

// Create a test app with mock routes for middleware testing
const app = express();
app.use(express.json());

// Mock route for testing verifyToken middleware
app.get("/protected", verifyToken, (req, res) => {
  res.status(200).json({ message: "Access granted", user: req.user });
});

// Mock route for testing isAdmin middleware
app.get("/admin", verifyToken, isAdmin, (req, res) => {
  res.status(200).json({ message: "Admin access granted" });
});

describe("Middleware Tests", () => {
  // Tests for verifyToken middleware
  describe("verifyToken", () => {
    beforeEach(() => {
      jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error in tests
    });

    afterEach(() => {
      jest.restoreAllMocks(); // Restore console.error after tests
    });

    test("Returns 401 if no token is provided", async () => {
      const res = await request(app).get("/protected"); // Simulate request without token

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorized: No token provided");
    });

    test("Returns 403 if token is invalid", async () => {
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer invalid-token"); // Simulate request with an invalid token

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Forbidden: Invalid token");
    });

    test("Allows access with a valid token", async () => {
      const validToken = jwt.sign(
        { id: "user-id", role: "user" },
        process.env.JWT_SECRET
      ); // Generate a valid token

      const res = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${validToken}`); // Simulate request with a valid token

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Access granted");
      expect(res.body.user).toEqual(
        expect.objectContaining({ id: "user-id", role: "user" })
      ); // Verify decoded user object
    });
  });

  // Tests for isAdmin middleware
  describe("isAdmin", () => {
    test("Returns 403 if user is not an admin", async () => {
      const userToken = jwt.sign(
        { id: "user-id", role: "user" },
        process.env.JWT_SECRET
      ); // Generate token for non-admin user

      const res = await request(app)
        .get("/admin")
        .set("Authorization", `Bearer ${userToken}`); // Simulate request with non-admin token

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Forbidden: Admins only");
    });

    test("Allows access if user is an admin", async () => {
      const adminToken = jwt.sign(
        { id: "admin-id", role: "admin" },
        process.env.JWT_SECRET
      ); // Generate token for admin user

      const res = await request(app)
        .get("/admin")
        .set("Authorization", `Bearer ${adminToken}`); // Simulate request with admin token

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Admin access granted");
    });
  });
});
