import { TextEncoder, TextDecoder } from "util";
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

// console.log("TextEncoder is set:", typeof globalThis.TextEncoder);

import "@testing-library/jest-dom";

// Environment variables for testing
globalThis.importMeta = {
  env: {
    VITE_API_URL: "http://localhost:5452/api",
  },
};
