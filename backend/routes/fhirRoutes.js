import express from "express";
import axios from "axios";
import Datasets from "../models/dataset.js";
import DatasetEntries from "../models/datasetEntries.js";
import { verifyToken, isAdmin } from "../middleware/userMiddleware.js";
import { logUserActivity } from "../controllers/analyticsController.js";

const router = express.Router();

/**
 * Utility function to handle dataset creation & logging
 */
const createOrUpdateDataset = async (name, description, type, userId) => {
  let dataset = await Datasets.findOne({ where: { name } });

  if (!dataset) {
    dataset = await Datasets.create({
      name,
      description,
      type,
      uploaded_by: userId,
      createdAt: new Date(), // Log upload timestamp
    });
  }

  return dataset;
};

/**
 * Fetch and Store Patient Data from HAPI FHIR
 */
router.get("/fetch-patients", verifyToken, isAdmin, async (req, res) => {
  try {
    console.log("Fetching patient data from FHIR API...");
    const fhirResponse = await axios.get(
      "https://hapi.fhir.org/baseR4/Patient?_count=10"
    );
    const fetchedData = fhirResponse.data.entry || [];

    if (fetchedData.length === 0) {
      return res.status(404).json({ message: "No patient data found." });
    }

    let dataset = await createOrUpdateDataset(
      "FHIR Patient Data",
      "FHIR Patients fetched from HAPI FHIR API",
      "Patient",
      req.user.id
    );

    const parsedPatients = fetchedData.map((entry) => ({
      dataset_id: dataset.id,
      data: {
        id: entry.resource?.id || "N/A",
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
    }));

    await DatasetEntries.bulkCreate(parsedPatients);

    // Log user activity
    const ipAddress = req.ip || "Unknown IP";
    await logUserActivity(
      req.user.id,
      "FHIR Data Fetch",
      "Fetched FHIR Patient Data",
      ipAddress
    );

    res
      .status(200)
      .json({ message: "FHIR Patient data stored successfully!", dataset });
  } catch (error) {
    console.error("Error fetching FHIR patient data:", error.message);
    res
      .status(500)
      .json({
        message: "Failed to fetch FHIR patient data",
        error: error.message,
      });
  }
});

/**
 * Fetch and Store Claims Data from HAPI FHIR
 */
router.get("/fetch-claims", verifyToken, isAdmin, async (req, res) => {
  try {
    console.log("Fetching claims data from FHIR API...");
    const fhirResponse = await axios.get(
      "https://hapi.fhir.org/baseR4/Claim?_count=10"
    );
    const fetchedData = fhirResponse.data.entry || [];

    if (fetchedData.length === 0) {
      return res.status(404).json({ message: "No claims data found." });
    }

    let dataset = await createOrUpdateDataset(
      "FHIR Claims Data",
      "FHIR Claims fetched from HAPI FHIR API",
      "Claim",
      req.user.id
    );

    const parsedClaims = fetchedData.map((entry) => ({
      dataset_id: dataset.id,
      data: {
        id: entry.resource?.id || "N/A",
        status: entry.resource?.status || "Unknown",
        type: entry.resource?.type?.coding?.[0]?.display || "N/A",
        patient: entry.resource?.patient?.reference || "Unknown Patient",
        total: entry.resource?.total?.value
          ? `$${entry.resource.total.value}`
          : "N/A",
      },
    }));

    await DatasetEntries.bulkCreate(parsedClaims);

    // Log user activity
    const ipAddress = req.ip || "Unknown IP";
    await logUserActivity(
      req.user.id,
      "FHIR Data Fetch",
      "Fetched FHIR Claims Data",
      ipAddress
    );

    res
      .status(200)
      .json({ message: "FHIR Claims data stored successfully!", dataset });
  } catch (error) {
    console.error("Error fetching FHIR claims data:", error.message);
    res
      .status(500)
      .json({
        message: "Failed to fetch FHIR claims data",
        error: error.message,
      });
  }
});

/**
 * Fetch and Store Encounter Data from HAPI FHIR
 */
router.get("/fetch-encounters", verifyToken, isAdmin, async (req, res) => {
  try {
    console.log("Fetching encounter data from FHIR API...");
    const fhirResponse = await axios.get(
      "https://hapi.fhir.org/baseR4/Encounter?_count=10"
    );
    const fetchedData = fhirResponse.data.entry || [];

    if (fetchedData.length === 0) {
      return res.status(404).json({ message: "No Encounter data found." });
    }

    let dataset = await createOrUpdateDataset(
      "FHIR Encounter Data",
      "FHIR Encounters fetched from HAPI FHIR API",
      "Encounter",
      req.user.id
    );

    const parsedEncounters = fetchedData.map((entry) => ({
      dataset_id: dataset.id,
      data: {
        id: entry.resource?.id || "N/A",
        status: entry.resource?.status || "Unknown",
        class: entry.resource?.class?.display || "Unknown",
        priority: entry.resource?.priority?.coding?.[0]?.display || "N/A",
        subject: entry.resource?.subject?.reference || "Unknown Patient",
        locations:
          entry.resource?.location
            ?.map((loc) => loc.location.display)
            .join(", ") || "No location",
        period: entry.resource?.period
          ? `${entry.resource.period.start || "Unknown"} to ${
              entry.resource.period.end || "Ongoing"
            }`
          : "Unknown Period",
        serviceProvider:
          entry.resource?.serviceProvider?.reference || "Unknown Provider",
      },
    }));

    await DatasetEntries.bulkCreate(parsedEncounters);

    // Log user activity
    const ipAddress = req.ip || "Unknown IP";
    await logUserActivity(
      req.user.id,
      "FHIR Data Fetch",
      "Fetched FHIR Encounter Data",
      ipAddress
    );

    res
      .status(200)
      .json({ message: "FHIR Encounter data stored successfully!", dataset });
  } catch (error) {
    console.error("Error fetching FHIR encounter data:", error.message);
    res
      .status(500)
      .json({
        message: "Failed to fetch FHIR encounter data",
        error: error.message,
      });
  }
});

export default router;
