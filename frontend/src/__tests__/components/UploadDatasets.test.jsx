/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import UploadDatasetPage from "../../components/UploadDatasetPage";
import api from "../../utils/api";

// Mock the API module
jest.mock("../../utils/api", () => ({
  post: jest.fn(),
}));

describe("UploadDatasetPage Component", () => {
  beforeEach(() => {
    api.post.mockClear();
  });

  test("renders the upload dataset form correctly", () => {
    render(
      <MemoryRouter>
        <UploadDatasetPage />
      </MemoryRouter>
    );

    // Check for form elements
    expect(screen.getByRole("heading", { name: /upload dataset/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Dataset Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dataset Type:/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose File/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Upload/i })).toBeInTheDocument();
  });

  test("displays selected file name after choosing a file", () => {
    render(
      <MemoryRouter>
        <UploadDatasetPage />
      </MemoryRouter>
    );

    const fileInput = screen.getByLabelText(/Choose File/i);

    // Simulate file selection
    const file = new File(["dummy content"], "example.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Check if the file name is displayed
    expect(screen.getByText("example.txt")).toBeInTheDocument();
  });
});
