/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, describe, jest, beforeEach } from "@jest/globals";
import { BrowserRouter } from "react-router-dom";
import DeleteDatasetPage from "../../components/DeleteDatasetPage";
import api from "../../utils/api";

// Mock the api module
jest.mock("../../utils/api", () => ({
  get: jest.fn(),
  delete: jest.fn(),
}));

// Mock useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("DeleteDatasetPage Component", () => {
  let mockNavigate;

  beforeEach(() => {
    // Clear mocks before each test
    api.get.mockClear();
    api.delete.mockClear();
    mockNavigate = jest.fn();
    require("react-router-dom").useNavigate.mockReturnValue(mockNavigate);
  });

  test("renders datasets and allows navigation back to the datasets page", async () => {
    // Mock datasets response
    api.get.mockResolvedValueOnce({
      data: [
        { id: "1", name: "Dataset 1" },
        { id: "2", name: "Dataset 2" },
      ],
    });

    render(
      <BrowserRouter>
        <DeleteDatasetPage />
      </BrowserRouter>
    );

    // Wait for datasets to load
    expect(await screen.findByText("Dataset 1")).toBeInTheDocument();
    expect(await screen.findByText("Dataset 2")).toBeInTheDocument();

    // Test back button functionality
    const backButton = screen.getByRole("button", { name: /back/i });
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith("/datasets");
  });

  test("deletes a dataset and displays a success message", async () => {
    // Mock datasets response
    api.get.mockResolvedValueOnce({
      data: [
        { id: "1", name: "Dataset 1" },
        { id: "2", name: "Dataset 2" },
      ],
    });

    // Mock delete response
    api.delete.mockResolvedValueOnce({
      data: { message: "Dataset deleted successfully" },
    });

    // Mock window.confirm
    window.confirm = jest.fn().mockReturnValue(true);

    render(
      <BrowserRouter>
        <DeleteDatasetPage />
      </BrowserRouter>
    );

    // Wait for datasets to load
    expect(await screen.findByText("Dataset 1")).toBeInTheDocument();
    expect(await screen.findByText("Dataset 2")).toBeInTheDocument();

    // Simulate delete button click
    const deleteButton = screen.getAllByRole("button", { name: /delete/i })[0];
    fireEvent.click(deleteButton);

    // Wait for the success message
    await waitFor(() => {
      expect(screen.getByText(/Dataset deleted successfully/i)).toBeInTheDocument();
    });

    // Ensure the deleted dataset is no longer rendered
    expect(screen.queryByText("Dataset 1")).not.toBeInTheDocument();
    expect(screen.getByText("Dataset 2")).toBeInTheDocument();
  });

  test("does not delete a dataset if the user cancels the confirmation dialog", async () => {
    // Mock datasets response
    api.get.mockResolvedValueOnce({
      data: [
        { id: "1", name: "Dataset 1" },
        { id: "2", name: "Dataset 2" },
      ],
    });

    // Mock window.confirm
    window.confirm = jest.fn().mockReturnValue(false);

    render(
      <BrowserRouter>
        <DeleteDatasetPage />
      </BrowserRouter>
    );

    // Wait for datasets to load
    expect(await screen.findByText("Dataset 1")).toBeInTheDocument();
    expect(await screen.findByText("Dataset 2")).toBeInTheDocument();

    // Simulate delete button click
    const deleteButton = screen.getAllByRole("button", { name: /delete/i })[0];
    fireEvent.click(deleteButton);

    // Ensure the API delete method was not called
    expect(api.delete).not.toHaveBeenCalled();

    // Ensure both datasets are still displayed
    expect(screen.getByText("Dataset 1")).toBeInTheDocument();
    expect(screen.getByText("Dataset 2")).toBeInTheDocument();
  });
});
