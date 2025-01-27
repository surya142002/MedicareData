/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import DatasetTable from "../../components/DatasetsTable";
import api from "../../utils/api";

// Mock the API module
jest.mock("../../utils/api", () => ({
  get: jest.fn(),
}));

describe("DatasetTable Component", () => {
  const mockDatasetId = "123";
  const mockDatasetName = "Test Dataset";

  beforeEach(() => {
    api.get.mockClear();
  });

  test("renders the table with dataset name and search bar", () => {
    render(<DatasetTable datasetId={mockDatasetId} datasetName={mockDatasetName} />);

    // Check if the dataset name is rendered
    expect(screen.getByRole("heading", { name: /test dataset/i })).toBeInTheDocument();

    // Check if the search bar is rendered
    expect(screen.getByPlaceholderText(/search in test dataset/i)).toBeInTheDocument();
  });

  test("fetches and displays dataset entries", async () => {
    // Mock API response
    api.get.mockResolvedValueOnce({
      data: {
        entries: [
          { id: "1", data: { code: "A01", description: "Test Description 1" } },
          { id: "2", data: { code: "B02", description: "Test Description 2" } },
        ],
        currentPage: 1,
        totalPages: 2,
      },
    });

    render(<DatasetTable datasetId={mockDatasetId} datasetName={mockDatasetName} />);

    // Wait for dataset entries to load
    expect(await screen.findByText("A01")).toBeInTheDocument();
    expect(await screen.findByText("Test Description 1")).toBeInTheDocument();
    expect(await screen.findByText("B02")).toBeInTheDocument();
    expect(await screen.findByText("Test Description 2")).toBeInTheDocument();
  });

  test("updates entries on search", async () => {
    // Mock API response for initial fetch
    api.get.mockResolvedValueOnce({
      data: {
        entries: [
          { id: "1", data: { code: "A01", description: "Test Description 1" } },
        ],
        currentPage: 1,
        totalPages: 1,
      },
    });

    // Mock API response for search
    api.get.mockResolvedValueOnce({
      data: {
        entries: [
          { id: "2", data: { code: "B02", description: "Search Result" } },
        ],
        currentPage: 1,
        totalPages: 1,
      },
    });

    render(<DatasetTable datasetId={mockDatasetId} datasetName={mockDatasetName} />);

    // Wait for initial entries to load
    expect(await screen.findByText("A01")).toBeInTheDocument();

    // Simulate typing in the search bar
    fireEvent.change(screen.getByPlaceholderText(/search in test dataset/i), {
      target: { value: "Search Term" },
    });

    // Wait for search results to load
    expect(await screen.findByText("B02")).toBeInTheDocument();
    expect(screen.getByText("Search Result")).toBeInTheDocument();
  });

  test("handles pagination controls", async () => {
    // Mock API response for page 1
    api.get.mockResolvedValueOnce({
      data: {
        entries: [
          { id: "1", data: { code: "A01", description: "Page 1 Entry" } },
        ],
        currentPage: 1,
        totalPages: 2,
      },
    });

    // Mock API response for page 2
    api.get.mockResolvedValueOnce({
      data: {
        entries: [
          { id: "2", data: { code: "B02", description: "Page 2 Entry" } },
        ],
        currentPage: 2,
        totalPages: 2,
      },
    });

    render(<DatasetTable datasetId={mockDatasetId} datasetName={mockDatasetName} />);

    // Wait for page 1 entries to load
    expect(await screen.findByText("Page 1 Entry")).toBeInTheDocument();

    // Click "Next" button to go to page 2
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    // Wait for page 2 entries to load
    expect(await screen.findByText("Page 2 Entry")).toBeInTheDocument();
  });

  test("disables pagination buttons when at the first or last page", async () => {
    // Mock API response for a single-page dataset
    api.get.mockResolvedValueOnce({
      data: {
        entries: [
          { id: "1", data: { code: "A01", description: "Single Page Entry" } },
        ],
        currentPage: 1,
        totalPages: 1,
      },
    });

    render(<DatasetTable datasetId={mockDatasetId} datasetName={mockDatasetName} />);

    // Wait for entries to load
    expect(await screen.findByText("Single Page Entry")).toBeInTheDocument();

    // Check that the "Previous" and "Next" buttons are disabled
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });
});
