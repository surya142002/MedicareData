import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default {
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy", // Mock CSS files
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"], // Updated path to setupTests
  transformIgnorePatterns: ["/node_modules/"],
};
