import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { MemoryRouter } from "react-router-dom";
import AnalyticsPage from "../../components/AnalyticsPage";
import api from "../../utils/api";

// Mock the API module
jest.mock("../../utils/api");

describe("AnalyticsPage", () => {
  const mockUserActivity = [
    {
      id: "1",
      userEmail: "user1@example.com",
      actionType: "login",
      actionDetails: "User logged in",
      timestamp: "2025-01-01T12:00:00Z",
      ipAddress: "192.168.1.1",
    },
    {
      id: "2",
      userEmail: "user2@example.com",
      actionType: "search",
      actionDetails: "Searched for ICD-10-CM",
      timestamp: "2025-01-02T15:30:00Z",
      ipAddress: "192.168.1.2",
    },
  ];

  const mockDatasetUsage = [
    {
      id: "1",
      datasetName: "ICD-10-CM",
      actionType: "search",
      searchTerm: "diabetes",
      usageCount: 10,
      timestamp: "2025-01-01T12:00:00Z",
    },
    {
      id: "2",
      datasetName: "HCPCS",
      actionType: "upload",
      searchTerm: null,
      usageCount: 1,
      timestamp: "2025-01-02T15:30:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mock data
  });

  test("renders user activity and dataset usage tables", async () => {
    // Mock the API calls
    api.get.mockImplementation((url) => {
      if (url.includes("user-activity")) {
        return Promise.resolve({
          data: {
            data: mockUserActivity,
            totalPages: 1,
          },
        });
      }
      if (url.includes("dataset-usage")) {
        return Promise.resolve({
          data: {
            data: mockDatasetUsage,
            totalPages: 1,
          },
        });
      }
    });

    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );

    // Assert that the loading indicators are displayed
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    // Wait for user activity and dataset usage data to load
    await waitFor(() => {
      expect(screen.getByText(/User Activity/i)).toBeInTheDocument();
      expect(screen.getByText(/Dataset Usage/i)).toBeInTheDocument();
    });

    // Verify user activity data
    expect(screen.getByText(/user1@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/User logged in/i)).toBeInTheDocument();
    expect(screen.getByText(/192.168.1.1/i)).toBeInTheDocument();

    // Verify dataset usage data
    expect(screen.getByText(/ICD-10-CM/i)).toBeInTheDocument();
    expect(screen.getByText(/search/i)).toBeInTheDocument();
    expect(screen.getByText(/diabetes/i)).toBeInTheDocument();
  });

  test("paginates user activity data", async () => {
    // Mock the API call for paginated data
    api.get.mockImplementation((url) => {
      if (url.includes("user-activity")) {
        return Promise.resolve({
          data: {
            data: mockUserActivity,
            totalPages: 2,
          },
        });
      }
      if (url.includes("dataset-usage")) {
        return Promise.resolve({
          data: {
            data: mockDatasetUsage,
            totalPages: 1,
          },
        });
      }
    });

    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );

    // Wait for the initial data to load
    await waitFor(() => {
      expect(screen.getByText(/User Activity/i)).toBeInTheDocument();
    });

    // Mock next page API call
    api.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "3",
            userEmail: "user3@example.com",
            actionType: "logout",
            actionDetails: "User logged out",
            timestamp: "2025-01-03T18:00:00Z",
            ipAddress: "192.168.1.3",
          },
        ],
        totalPages: 2,
      },
    });

    // Click on the "Next" button
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    // Wait for the next page data to load
    await waitFor(() => {
      expect(screen.getByText(/user3@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
    });
  });

  test("displays error messages if API calls fail", async () => {
    // Mock the API calls to fail
    api.get.mockRejectedValue(new Error("Failed to fetch data"));

    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );

    // Wait for error messages to display
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/i)).toBeInTheDocument();
    });
  });
});
