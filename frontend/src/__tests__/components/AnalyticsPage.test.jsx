/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import AnalyticsPage from "../../components/AnalyticsPage";
import api from "../../utils/api";

// Mock the API module
jest.mock("../../utils/api", () => ({
  get: jest.fn(),
}));

describe("AnalyticsPage Component", () => {
  beforeEach(() => {
    api.get.mockClear();
  });

  test("renders the Analytics Dashboard with sections", () => {
    render(
      <BrowserRouter>
        <AnalyticsPage />
      </BrowserRouter>
    );

    expect(screen.getByRole("heading", { name: /analytics dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /user activity/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /dataset usage/i })).toBeInTheDocument();
  });

  test("fetches and displays user activity data", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "1",
            userEmail: "user1@example.com",
            actionType: "login",
            actionDetails: "User logged in",
            timestamp: "2025-01-25T12:00:00Z",
            ipAddress: "192.168.0.1",
          },
        ],
        totalPages: 1,
      },
    });

    render(
      <BrowserRouter>
        <AnalyticsPage />
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(screen.getByText("user1@example.com")).toBeInTheDocument()
    );
    expect(screen.getByText("User logged in")).toBeInTheDocument();
    expect(screen.getByText("192.168.0.1")).toBeInTheDocument();
  });
    

  test("displays an error message if user activity data fails to load", async () => {
    api.get.mockRejectedValueOnce({
      response: {
        data: "Mocked error message",
      },
    });

    render(
      <BrowserRouter>
        <AnalyticsPage />
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(
        screen.getByText(/failed to fetch user activity/i)
      ).toBeInTheDocument()
    );
  });

  test("displays an error message if dataset usage data fails to load", async () => {
    api.get.mockRejectedValueOnce({
      response: {
        data: "Mocked error message",
      },
    });

    render(
      <BrowserRouter>
        <AnalyticsPage />
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(
        screen.getByText(/failed to fetch dataset usage/i)
      ).toBeInTheDocument()
    );
  });

  test("handles pagination for user activity", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "1",
            userEmail: "user1@example.com",
            actionType: "login",
            actionDetails: "User logged in",
            timestamp: "2025-01-25T12:00:00Z",
            ipAddress: "192.168.0.1",
          },
        ],
        totalPages: 2,
      },
    });

    render(
      <BrowserRouter>
        <AnalyticsPage />
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(screen.getByText("user1@example.com")).toBeInTheDocument()
    );

    api.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "2",
            userEmail: "user2@example.com",
            actionType: "logout",
            actionDetails: "User logged out",
            timestamp: "2025-01-25T13:00:00Z",
            ipAddress: "192.168.0.2",
          },
        ],
        totalPages: 2,
      },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /next/i }));
    });

    await waitFor(() =>
      expect(screen.getByText("user2@example.com")).toBeInTheDocument()
    );
    expect(screen.getByText("User logged out")).toBeInTheDocument();
    expect(screen.getByText("192.168.0.2")).toBeInTheDocument();
  });
});
