import { decodeJWT } from "../../utils/decodeJWT";
import { describe, test, expect } from "@jest/globals";

describe("decodeJWT", () => {
  test("decodes a valid JWT token", () => {
    // Example of a valid base64-encoded JWT payload
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
      "eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ." +
      "sflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    const decoded = decodeJWT(token);

    expect(decoded).toEqual({
      userId: "1234567890",
      role: "admin",
      iat: 1516239022,
    });
  });

  test("throws an error for invalid JWT structure", () => {
    const invalidToken = "invalid.token.structure";

    expect(() => decodeJWT(invalidToken)).toThrow("Failed to decode JWT token");
  });

  test("handles missing or empty token gracefully", () => {
    expect(() => decodeJWT("")).toThrow("Failed to decode JWT token");
    expect(() => decodeJWT(null)).toThrow("Failed to decode JWT token");
    expect(() => decodeJWT(undefined)).toThrow("Failed to decode JWT token");
  });
});
