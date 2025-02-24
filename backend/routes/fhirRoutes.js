import express from "express";
import axios from "axios";
import Datasets from "../models/dataset.js";
import DatasetEntries from "../models/datasetEntries.js";
import { verifyToken, isAdmin } from "../middleware/userMiddleware.js";
import { logUserActivity } from "../controllers/analyticsController.js";

const router = express.Router();
const FHIR_BASE_URL = "https://hapi.fhir.org/baseR4";
const FETCH_LIMIT = 1000; // Increase from 10 to 1000 for larger imports

/**
 * Utility function to create or update dataset records
 */
const createOrUpdateDataset = async (name, description, type, userId) => {
  let dataset = await Datasets.findOne({ where: { name } });

  if (!dataset) {
    dataset = await Datasets.create({
      name,
      description,
      type,
      uploaded_by: userId,
      createdAt: new Date(),
    });
  }

  return dataset;
};

/**
 * Fetch and store FHIR resource data
 */
const fetchFHIRData = async (
  resource,
  userId,
  datasetName,
  datasetType,
  processData
) => {
  try {
    console.log(`Fetching ${resource} data from FHIR API...`);

    const fhirResponse = await axios.get(
      `${FHIR_BASE_URL}/${resource}?_count=${FETCH_LIMIT}`
    );
    const fetchedData = fhirResponse.data.entry || [];

    if (fetchedData.length === 0) {
      console.warn(`No ${resource} data found.`);
      return { success: false, message: `No ${resource} data found.` };
    }

    let dataset = await createOrUpdateDataset(
      datasetName,
      `FHIR ${datasetType} data`,
      datasetType,
      userId
    );

    // Process and format data
    const parsedData = fetchedData.map((entry) =>
      processData(entry, dataset.id)
    );

    // Batch insert parsed data
    await DatasetEntries.bulkCreate(parsedData, { validate: true });

    console.log(
      `✅ Successfully stored ${parsedData.length} ${resource} records.`
    );
    return { success: true, message: `${resource} data stored successfully.` };
  } catch (error) {
    console.error(`Error fetching ${resource} data:`, error.message);
    return { success: false, message: `Failed to fetch ${resource} data.` };
  }
};

/**
 * Patient Data Mapping (Ensures Searchable Fields)
 */
const processPatient = (entry, datasetId) => ({
  dataset_id: datasetId,
  data: {
    code: entry.resource?.id || "N/A", // 🔹 Makes it searchable
    description: `Patient: ${entry.resource?.name?.[0]?.text || "Unknown"}`, // 🔹 Makes it searchable
    name:
      entry.resource?.name
        ?.map((n) => n.text || `${n.given?.join(" ")} ${n.family}`)
        .join(", ") || "Unknown",
    gender: entry.resource?.gender || "Unknown",
    birthDate: entry.resource?.birthDate || "N/A",
    address:
      entry.resource?.address?.map((a) => a.text || "Unknown").join(", ") ||
      "No Address",
  },
});

/**
 * Claim Data Mapping (Ensures Searchable Fields)
 */
const processClaim = (entry, datasetId) => ({
  dataset_id: datasetId,
  data: {
    code: entry.resource?.id || "N/A", // 🔹 Makes it searchable
    description: `Claim for ${
      entry.resource?.patient?.reference || "Unknown Patient"
    }`, // 🔹 Makes it searchable
    status: entry.resource?.status || "Unknown",
    type: entry.resource?.type?.coding?.[0]?.display || "N/A",
    total: entry.resource?.total?.value
      ? `$${entry.resource.total.value}`
      : "N/A",
  },
});

/**
 * Encounter Data Mapping (Ensures Searchable Fields)
 */
const processEncounter = (entry, datasetId) => ({
  dataset_id: datasetId,
  data: {
    code: entry.resource?.id || "N/A", // 🔹 Makes it searchable
    description: `Encounter: ${entry.resource?.class?.display || "Unknown"}`, // 🔹 Makes it searchable
    status: entry.resource?.status || "Unknown",
    subject: entry.resource?.subject?.reference || "Unknown Patient",
    period: entry.resource?.period
      ? `${entry.resource.period.start || "Unknown"} to ${
          entry.resource.period.end || "Ongoing"
        }`
      : "Unknown Period",
    serviceProvider:
      entry.resource?.serviceProvider?.reference || "Unknown Provider",
  },
});

/**
 * API Routes for fetching data
 */
router.get("/fetch-patients", verifyToken, isAdmin, async (req, res) => {
  const result = await fetchFHIRData(
    "Patient",
    req.user.id,
    "FHIR Patient Data",
    "Patient",
    processPatient
  );
  res.status(result.success ? 200 : 500).json({ message: result.message });
});

router.get("/fetch-claims", verifyToken, isAdmin, async (req, res) => {
  const result = await fetchFHIRData(
    "Claim",
    req.user.id,
    "FHIR Claims Data",
    "Claim",
    processClaim
  );
  res.status(result.success ? 200 : 500).json({ message: result.message });
});

router.get("/fetch-encounters", verifyToken, isAdmin, async (req, res) => {
  const result = await fetchFHIRData(
    "Encounter",
    req.user.id,
    "FHIR Encounter Data",
    "Encounter",
    processEncounter
  );
  res.status(result.success ? 200 : 500).json({ message: result.message });
});

export default router;
