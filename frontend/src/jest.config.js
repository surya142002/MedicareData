import dotenv from "dotenv";

dotenv.config({ path: ".env.test" }); // Load test-specific environment variables

export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // Use Babel for ESM
  },
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy", // Mock CSS imports
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"], // Include global test setup
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  extensionsToTreatAsEsm: [".jsx"], // Treat JSX files as ESM
};
