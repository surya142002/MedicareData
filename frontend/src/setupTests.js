import { TextEncoder, TextDecoder } from "util";
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

console.log("TextEncoder is set:", typeof globalThis.TextEncoder);

import "@testing-library/jest-dom";
import { server } from "./mocks/server";
import { afterAll, beforeAll, afterEach } from "@jest/globals";

// Environment variables for testing
globalThis.importMeta = {
  env: {
    VITE_API_URL: "http://localhost:5452/api",
  },
};

// Start the server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
