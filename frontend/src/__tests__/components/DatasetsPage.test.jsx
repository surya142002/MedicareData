/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import DatasetsPage from "../../components/DatasetsPage";
import api from "../../utils/api";

// Mock the API module
jest.mock("../../utils/api", () => ({
  get: jest.fn(),
}));

describe("DatasetsPage Component (Without Navigation)", () => {
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    api.get.mockClear();
    mockOnLogout.mockClear();
  });

  test("renders the datasets page with available datasets", async () => {
    // Mock datasets response
    api.get.mockResolvedValueOnce({
      data: [
        { id: "1", name: "Dataset 1" },
        { id: "2", name: "Dataset 2" },
      ],
    });

    render(
      <BrowserRouter>
        <DatasetsPage onLogout={mockOnLogout} />
      </BrowserRouter>
    );

    // Wait for datasets to load
    expect(await screen.findByText("Dataset 1")).toBeInTheDocument();
    expect(await screen.findByText("Dataset 2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /available datasets/i })).toBeInTheDocument();
  });

  test("displays a message if no datasets are available", async () => {
    // Mock empty datasets response
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <DatasetsPage onLogout={mockOnLogout} />
      </BrowserRouter>
    );

    // Wait for the message to display
    expect(await screen.findByText(/no datasets available/i)).toBeInTheDocument();
  });

  test("calls onLogout when the logout button is clicked", async () => {
    // Mock datasets response
    api.get.mockResolvedValueOnce({
      data: [
        { id: "1", name: "Dataset 1" },
        { id: "2", name: "Dataset 2" },
      ],
    });

    render(
      <BrowserRouter>
        <DatasetsPage onLogout={mockOnLogout} />
      </BrowserRouter>
    );

    // Wait for datasets to load
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    logoutButton.click(); // Simulate click

    // Ensure the onLogout callback was called
    expect(mockOnLogout).toHaveBeenCalled();
  });
});
