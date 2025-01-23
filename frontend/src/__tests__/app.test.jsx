/**
 * @jest-environment jsdom
 */
import React from "react";
import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import App from "../App";
import api from "../utils/api";
import { decodeJWT } from "../utils/decodeJWT";

// Mock the API module
jest.mock("../utils/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

// Mock the decodeJWT function
jest.mock("../utils/decodeJWT", () => ({
  decodeJWT: jest.fn(),
}));

describe("App Component", () => {
  beforeEach(() => {
    // Clear mocks before each test
    api.get.mockClear();
    api.post.mockClear();
    decodeJWT.mockClear();
  });

  test("renders the Login page by default", () => {
    render(<App />);

    // Check that the Login form is rendered
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
  });

  test("renders the Registration page when navigating to /register", () => {
    window.history.pushState({}, "Test Page", "/register");

    render(<App />);

    // Check that the Registration form is rendered
    expect(screen.getByRole("heading", { name: /register/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
  });

  test("renders the Datasets page when navigating to /datasets after login", async () => {
    // Mock token validation and dataset fetching
    api.get
      .mockResolvedValueOnce({ data: { valid: true } }) // Token validation
      .mockResolvedValueOnce({
        data: [
          { id: "1", name: "Dataset 1" },
          { id: "2", name: "Dataset 2" },
        ],
      }); // Dataset list

    // Mock decodeJWT function to return a valid user role
    decodeJWT.mockReturnValue({ role: "user" });

    // Simulate the user being logged in
    localStorage.setItem("token", "mock-token"); // Mock token
    localStorage.setItem("role", "user"); // Mock role

    window.history.pushState({}, "Test Page", "/datasets");

    render(<App />);

    // Wait for the Datasets page to load
    expect(await screen.findByRole("heading", { name: /available datasets/i })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  test("redirects to the Login page when no token is present", () => {
    localStorage.removeItem("token"); // Ensure no token is set
    localStorage.removeItem("role");

    window.history.pushState({}, "Test Page", "/datasets");

    render(<App />);

    // Check that the Login form is rendered
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });
});
