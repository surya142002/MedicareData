import { standardizeAndFilter } from "../utils/dataCleaner.js";
import fs from "fs";
import Datasets from "../models/dataset.js";
import DatasetEntries from "../models/datasetEntries.js";
import DatasetUsage from "../models/datasetUsage.js";
import { logUserActivity, logDatasetUsage } from "./analyticsController.js";
import { parseDataset } from "../utils/datasetParser.js";
import { Op, Sequelize } from "sequelize";

// -----------------------------
// Upload Dataset
// -----------------------------
export const uploadDataset = async (req, res) => {
  try {
    console.log("✅ Received dataset upload request.");

    if (!req.file) {
      return res.status(400).json({ message: "File is required." });
    }

    const { name, description, datasetType } = req.body;

    const allowedTypes = ["ICD-10-CM", "HCPCS"];
    if (!allowedTypes.includes(datasetType)) {
      return res.status(400).json({ message: "❌ Unsupported dataset type" });
    }

    res.status(202).json({
      message: "Dataset upload started",
      filename: req.file.filename,
    });

    setImmediate(async () => {
      try {
        const inputFile = req.file.path;
        const cleanedFile = `${inputFile}_cleaned.txt`;

        await standardizeAndFilter(inputFile, cleanedFile);

        const dataset = await Datasets.create({
          name,
          description,
          type: datasetType,
          uploaded_by: req.user.id,
        });

        await logDatasetUsage(dataset.id, "upload", null, req.user.id);

        const fileContent = fs.readFileSync(cleanedFile, "utf-8");
        const rows = fileContent.split("\n").map((line) => line.split("\t"));
        const parsedRows = parseDataset(datasetType, rows);

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

        if (failedEntries.length > 0) {
          console.error(`❌ Failed to insert ${failedEntries.length} entries.`);
        }

        console.log("✅ Dataset processing completed!");
      } catch (error) {
        console.error("❌ Error processing dataset:", error);
      }
    });
  } catch (error) {
    console.error("❌ Error handling dataset upload:", error.message);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

const chunkArray = (array, size) =>
  Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );

// -----------------------------
// Delete Dataset
// -----------------------------
export const deleteDataset = async (req, res) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Datasets.findByPk(datasetId);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    await DatasetUsage.destroy({ where: { dataset_id: datasetId } });
    await DatasetEntries.destroy({ where: { dataset_id: datasetId } });
    await Datasets.destroy({ where: { id: datasetId } });

    await logUserActivity(
      req.user.id,
      "dataset_delete",
      `Deleted dataset: ${dataset.name}`,
      req.ip
    );

    res.status(200).json({ message: "Dataset deleted successfully" });
  } catch (error) {
    console.error("Error deleting dataset:", error.message);
    res.status(500).json({ message: "Failed to delete dataset" });
  }
};

// -----------------------------
// FIXED EXACT SEARCH
// -----------------------------
export const getDatasetEntries = async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { searchTerm = "", page = 1, limit = 20, mode = "exact" } = req.query;

    console.log("🔥 EXACT ROUTE CALLED WITH:", req.query);

    const offset = (page - 1) * limit;

    const dataset = await Datasets.findByPk(datasetId);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    // retrieve fields
    const sample = await DatasetEntries.findOne({
      where: { dataset_id: datasetId },
    });

    if (!sample) {
      return res.json({
        entries: [],
        count: 0,
        currentPage: 1,
        totalPages: 1,
      });
    }

    const fields = Object.keys(sample.data);

    // build WHERE
    let whereCondition = { dataset_id: datasetId };

    if (searchTerm.trim().length > 0) {
      whereCondition = {
        dataset_id: datasetId,
        [Op.or]: fields.map((field) => ({
          data: { [field]: { [Op.iLike]: `%${searchTerm}%` } },
        })),
      };

      await logDatasetUsage(datasetId, "search", searchTerm, req.user.id);
    } else {
      await logUserActivity(
        req.user.id,
        "view_dataset",
        `Viewed dataset: ${dataset.name}`,
        req.ip
      );
    }

    const entries = await DatasetEntries.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset,
      order: [["created_at", "DESC"]],
    });

    return res.json({
      entries: entries.rows,
      count: entries.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(entries.count / limit),
    });
  } catch (error) {
    console.error("Error fetching dataset entries:", error.message);
    res.status(500).json({ message: "Failed to fetch dataset entries" });
  }
};
