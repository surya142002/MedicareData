/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, describe, jest } from "@jest/globals";
import { BrowserRouter } from "react-router-dom";
import LoginForm from "../../components/LoginForm";

describe("LoginForm Component", () => {
  test("renders login form with email and password fields", () => {
    render(
      <BrowserRouter>
        <LoginForm setIsLoggedIn={jest.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  test("submits the form with valid inputs", () => {
    const mockSetIsLoggedIn = jest.fn();

    render(
      <BrowserRouter>
        <LoginForm setIsLoggedIn={mockSetIsLoggedIn} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email:/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password:/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    expect(screen.getByLabelText(/Email:/i).value).toBe("test@example.com");
    expect(screen.getByLabelText(/Password:/i).value).toBe("password123");
  });
});
