import api from "../../utils/api";
import axios from "axios";
import { afterEach, describe, jest, test, expect } from "@testing-library/react";

jest.mock("axios"); // Mock Axios

describe("API utility", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear any mocks between tests
  });

  test("should have the correct base URL", () => {
    expect(api.defaults.baseURL).toBe("http://localhost:5452/api");
  });

  test("should attach Authorization header if token is present in localStorage", async () => {
    // Mock localStorage to return a token
    jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "token") return "mock-token";
      return null;
    });

    // Mock Axios response
    axios.get.mockResolvedValue({ data: "success" });

    await api.get("/datasets");

    // Check if Axios was called with Authorization header
    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String), // Ignore URL match for simplicity
      expect.objectContaining({
        headers: { Authorization: "Bearer mock-token" },
      })
    );
  });

  test("should not attach Authorization header if no token is present", async () => {
    // Mock localStorage to return no token
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => null);

    // Mock Axios response
    axios.get.mockResolvedValue({ data: "success" });

    await api.get("/datasets");

    // Check if Axios was called without Authorization header
    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.not.objectContaining({
        headers: { Authorization: expect.any(String) },
      })
    );
  });

  test("should handle GET requests", async () => {
    // Mock Axios response
    const mockData = { id: "1", name: "ICD-10-CM" };
    axios.get.mockResolvedValue({ data: mockData });

    const response = await api.get("/datasets");

    // Verify Axios was called correctly and response data
    expect(axios.get).toHaveBeenCalledWith("/datasets", undefined);
    expect(response.data).toEqual(mockData);
  });

  test("should handle POST requests", async () => {
    // Mock Axios response
    const mockData = { message: "Dataset uploaded successfully" };
    axios.post.mockResolvedValue({ data: mockData });

    const response = await api.post("/datasets/upload", { name: "ICD-10-CM" });

    // Verify Axios was called correctly and response data
    expect(axios.post).toHaveBeenCalledWith(
      "/datasets/upload",
      { name: "ICD-10-CM" },
      undefined
    );
    expect(response.data).toEqual(mockData);
  });

  test("should handle errors gracefully", async () => {
    // Mock Axios to reject with an error
    const mockError = new Error("Request failed");
    axios.get.mockRejectedValue(mockError);

    await expect(api.get("/datasets")).rejects.toThrow("Request failed");

    // Verify Axios was called correctly
    expect(axios.get).toHaveBeenCalledWith("/datasets", undefined);
  });
});
