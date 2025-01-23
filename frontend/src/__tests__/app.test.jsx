import { render, screen, test, expect } from "@testing-library/react";
import jest from "jest-mock";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

test("renders login page by default", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
});

test("navigates to datasets page after login", async () => {
  // Mock localStorage with a valid token and role
  jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
    if (key === "token") return "mock-token";
    if (key === "role") return "admin";
    return null;
  });

  render(
    <MemoryRouter initialEntries={["/datasets"]}>
      <App />
    </MemoryRouter>
  );

  // Assert datasets page renders
  expect(await screen.findByText(/Available Datasets/i)).toBeInTheDocument();
});

test("redirects non-admin to datasets page from admin route", () => {
  // Mock localStorage with a non-admin role
  jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
    if (key === "role") return "user";
    return null;
  });

  render(
    <MemoryRouter initialEntries={["/upload"]}>
      <App />
    </MemoryRouter>
  );

  expect(screen.queryByText(/Upload Dataset/i)).not.toBeInTheDocument();
});
