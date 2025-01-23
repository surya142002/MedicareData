/**
 * @jest-environment jsdom
 */
import api from "../../utils/api.jsx";
import axios from "axios";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("axios");

describe("API Configuration", () => {
  beforeEach(() => {
    localStorage.clear(); // Clear localStorage before each test
    jest.clearAllMocks(); // Clear all mock calls
  });

  test("uses the correct base URL from environment variables", () => {
    // Check that the base URL is configured correctly
    expect(api.defaults.baseURL).toBe(import.meta.env.VITE_API_URL || "http://localhost:5452/api");
  });

  test("attaches the token to the Authorization header manually", async () => {
    // Mock token in localStorage
    const mockToken = "mock-jwt-token";
    localStorage.setItem("token", mockToken);

    // Mock API request
    axios.get.mockResolvedValueOnce({ data: "mock response" });

    // Make a manual request using the API
    const response = await api.get("/test-endpoint", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    // Check that the Authorization header was added correctly
    expect(axios.get).toHaveBeenCalledWith(`${api.defaults.baseURL}/test-endpoint`, {
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    });
    expect(response.data).toBe("mock response");
  });

  test("makes a request without Authorization header if no token is present", async () => {
    // Ensure no token in localStorage
    localStorage.removeItem("token");

    // Mock API request
    axios.get.mockResolvedValueOnce({ data: "mock response" });

    // Make a manual request using the API
    const response = await api.get("/test-endpoint");

    // Check that the Authorization header was not added
    expect(axios.get).toHaveBeenCalledWith(`${api.defaults.baseURL}/test-endpoint`, {});
    expect(response.data).toBe("mock response");
  });

  test("handles errors from requests", async () => {
    // Mock an error response
    const mockError = new Error("Request failed");
    axios.get.mockRejectedValueOnce(mockError);

    try {
      await api.get("/test-endpoint");
    } catch (error) {
      // Ensure the error is thrown
      expect(error).toBe(mockError);
    }

    // Ensure axios.get was called
    expect(axios.get).toHaveBeenCalledWith(`${api.defaults.baseURL}/test-endpoint`);
  });
});
