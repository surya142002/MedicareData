import "@testing-library/jest-dom";
import { server } from "./mocks/server";
import { afterAll, beforeAll, afterEach } from "@jest/globals";

// environment variables for testing
globalThis.importMeta = {
  env: {
    VITE_API_URL: "http://localhost:5452/api",
  },
};

// Start the server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close the server after all tests
afterAll(() => server.close());
