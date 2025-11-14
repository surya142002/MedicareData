import { standardizeAndFilter } from "../utils/dataCleaner.js";
import fs from "fs";
import Datasets from "../models/dataset.js";
import DatasetEntries from "../models/datasetEntries.js";
import DatasetUsage from "../models/datasetUsage.js";
import { logUserActivity, logDatasetUsage } from "./analyticsController.js";
import { parseDataset } from "../utils/datasetParser.js";
import { Op, Sequelize } from "sequelize";

/**
 * Uploads a new dataset and parses its entries.
 *
 * @param {Object} req - The request object containing dataset information and the uploaded file.
 * @param {Object} res - The response object.
 */
export const uploadDataset = async (req, res) => {
  try {
    console.log("✅ Received dataset upload request.");

    // 🔹 Validate file upload
    if (!req.file) {
      console.error("❌ No file received in the request.");
      return res.status(400).json({ message: "File is required." });
    }

    // Extract dataset details from request body
    const { name, description, datasetType } = req.body;

    // 🔹 Define supported dataset types
    const allowedTypes = [
      "ICD-10-CM",
      "HCPCS",
      // "RVU",
      // "FeeSchedules",
      // "MUE Edits",
      // "LMRP",
    ];
    if (!allowedTypes.includes(datasetType)) {
      return res
        .status(400)
        .json({ message: `❌ Unsupported dataset type: ${datasetType}` });
    }

    console.log(`📂 Uploaded File: ${req.file.path}`);

    // ✅ Respond immediately to prevent frontend timeout
    res
      .status(202)
      .json({ message: "Dataset upload started", filename: req.file.filename });

    setImmediate(async () => {
      try {
        const inputFile = req.file.path;
        const cleanedFile = `${inputFile}_cleaned.txt`;

        console.log(`⚙️ Processing file: ${inputFile}`);

        // 🔹 Standardize & filter dataset (if applicable)
        await standardizeAndFilter(inputFile, cleanedFile);
        console.log(`✅ File cleaned successfully: ${cleanedFile}`);

        // ✅ Create a new dataset record in the database
        const dataset = await Datasets.create({
          name,
          description,
          type: datasetType,
          uploaded_by: req.user.id,
        });

        console.log(`✅ Dataset created in DB: ${dataset.id}`);

        // 🔹 Log dataset upload
        await logDatasetUsage(dataset.id, "upload", null, req.user.id);

        // ✅ Read & parse the cleaned file
        console.log(`📖 Reading cleaned file: ${cleanedFile}`);
        const fileContent = fs.readFileSync(cleanedFile, "utf-8");
        const rows = fileContent.split("\n").map((line) => line.split("\t"));
        const parsedRows = parseDataset(datasetType, rows);

        console.log(`✅ Parsed ${parsedRows.length} entries from file.`);

        // 🔹 Batch insert parsed data into DB for better performance
        const failedEntries = [];
        for (const batch of chunkArray(parsedRows, 1000)) {
          try {
            await DatasetEntries.bulkCreate(
              batch.map((row) => ({ dataset_id: dataset.id, data: row })),
              { validate: true }
            );
          } catch (error) {
            failedEntries.push(...batch);
            console.error(`❌ Error inserting batch: ${error.message}`);
          }
        }

        // 🔹 Log failed entries
        if (failedEntries.length > 0) {
          console.error(`❌ Failed to insert ${failedEntries.length} entries.`);
        }

        console.log("✅ Dataset processing completed!");
      } catch (error) {
        console.error("❌ Error processing dataset:", error);
      }
    });
  } catch (error) {
    console.error("❌ Error handling dataset upload:", error);
    res
      .status(500)
      .json({ message: "Failed to upload dataset", error: error.message });
  }
};

/**
 * 🔹 Helper function to split an array into chunks
 * @param {Array} array - The array to chunk
 * @param {number} size - The chunk size
 * @returns {Array} - Chunked array
 */
const chunkArray = (array, size) => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
};

/**
 * Deletes a dataset and its associated entries and logs.
 *
 * @param {Object} req - The request object containing the dataset ID.
 * @param {Object} res - The response object.
 */
export const deleteDataset = async (req, res) => {
  try {
    const { datasetId } = req.params;

    // Fetch the dataset to check if it exists
    const dataset = await Datasets.findByPk(datasetId);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    // Delete associated records in DatasetUsage
    await DatasetUsage.destroy({ where: { dataset_id: datasetId } });

    // Delete associated records in DatasetEntries (if applicable)
    await DatasetEntries.destroy({ where: { dataset_id: datasetId } });

    // Delete the dataset
    await Datasets.destroy({ where: { id: datasetId } });

    // Log user activity
    await logUserActivity(
      req.user.id,
      "dataset_delete",
      `Deleted dataset: ${dataset.name}`,
      req.ip
    );

    res.status(200).json({ message: "Dataset deleted successfully" });
  } catch (error) {
    console.error("Error deleting dataset:", error.message);
    res
      .status(500)
      .json({ message: "Failed to delete dataset", error: error.message });
  }
};

/**
 * Fetches entries of a dataset with optional search and pagination.
 *
 * @param {Object} req - The request object containing dataset ID, search term, and pagination info.
 * @param {Object} res - The response object.
 */
export const getDatasetEntries = async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { searchTerm = "", page = 1, limit = 20, mode = "exact" } = req.query;

    console.log("🔥 EXACT ROUTE CALLED WITH:", req.query);

    // NEW: Prevent exact-search from overwriting AI results
    if (mode === "semantic") {
      return res.json({
        entries: [],
        count: 0,
        currentPage: 1,
        totalPages: 1,
      });
    }

    const offset = (page - 1) * limit;

    const dataset = await Datasets.findByPk(datasetId);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    // Define search condition
    let whereCondition = { dataset_id: datasetId };

    if (searchTerm) {
      whereCondition = {
        dataset_id: datasetId,
        [Op.and]: [Sequelize.literal(`data::text ILIKE '%${searchTerm}%'`)],
      };

      // Log dataset search
      await logDatasetUsage(datasetId, "search", searchTerm, req.user.id);
    } else {
      // Log view only when not searching
      await logUserActivity(
        req.user.id,
        "view_dataset",
        `Viewed dataset: ${dataset.name}`,
        req.ip
      );
    }

    const entries = await DatasetEntries.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit, 10),
      offset,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      entries: entries.rows,
      count: entries.count,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(entries.count / limit),
    });
  } catch (error) {
    console.error(`Error fetching dataset entries:`, error.message);
    res.status(500).json({
      message: "Failed to fetch dataset entries",
      error: error.message,
    });
  }
};
