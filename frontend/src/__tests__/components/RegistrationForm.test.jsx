/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, describe, jest } from "@jest/globals";
import { BrowserRouter } from "react-router-dom";
import RegistrationForm from "../../components/RegistrationForm";
import api from "../../utils/api";

// Mock the api.post function
jest.mock("../../utils/api", () => ({
  post: jest.fn(),
}));

describe("RegistrationForm Component", () => {
  test("renders registration form with email, password, and confirm password fields", () => {
    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    // Check that the form fields and button are rendered
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password:", { selector: "input#register-password" })).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password:", { selector: "input#register-confirmPassword" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
  });

  test("displays an error when passwords do not match", () => {
    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    // Simulate user input
    fireEvent.change(screen.getByLabelText(/Email:/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password:", { selector: "input#register-password" }), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password:", { selector: "input#register-confirmPassword" }), {
      target: { value: "password321" },
    });

    // Simulate form submission
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    // Check for error message
    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  test("submits the form with valid inputs", async () => {
    // Mock a successful response for the registration API call
    api.post.mockResolvedValueOnce({ data: { message: "Registration successful!" } });

    // Mock the window.alert function to avoid actual alerts during testing
    window.alert = jest.fn();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    // Simulate user input
    fireEvent.change(screen.getByLabelText(/Email:/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password:", { selector: "input#register-password" }), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password:", { selector: "input#register-confirmPassword" }), {
      target: { value: "password123" },
    });

    // Simulate form submission
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    // Wait for the API call to complete and navigation to trigger
    await screen.findByText(/Log in here/i);

    // Check that alert is displayed
    expect(window.alert).toHaveBeenCalledWith("Registration successful! Please log in.");
  });
});
