import db from "./dbTestConfig.js";
import initModels from "../models/initModels.js";

// Initialize models
const models = initModels(db);

beforeAll(async () => {
  // Sync models with the in-memory SQLite database
  await db.sync();
});

afterAll(async () => {
  // Close the database connection
  await db.close();
});

// Export the database connection and models
export { db, models };
