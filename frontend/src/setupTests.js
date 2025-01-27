import { TextEncoder, TextDecoder } from "util";
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

import "@testing-library/jest-dom";

// Environment variables for testing
globalThis.importMeta = {
  env: {
    VITE_API_URL: "http://localhost:5452/api",
  },
};

// Suppress console methods globally
console.error = () => {}; // Suppress console.error
console.warn = () => {}; // Suppress console.warn
console.log = () => {}; // Suppress console.log (optional)
