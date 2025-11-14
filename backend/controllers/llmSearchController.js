import { expandQuery } from "../utils/openaiClient.js";
import DatasetEntries from "../models/datasetEntries.js";
import Datasets from "../models/dataset.js";
import { Op } from "sequelize";
import { logDatasetUsage } from "./analyticsController.js";

export const llmSearch = async (req, res) => {
  const { datasetId, query } = req.body;

  console.log("🔥 LLM ROUTE HIT:", query);

  if (!datasetId || !query) {
    return res.status(400).json({ message: "datasetId and query required" });
  }

  try {
    await logDatasetUsage(datasetId, "semantic_search", query, req.user.id);

    const dataset = await Datasets.findByPk(datasetId);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    const sample = await DatasetEntries.findOne({
      where: { dataset_id: datasetId },
    });
    if (!sample) return res.status(404).json({ message: "Dataset is empty" });

    const fields = Object.keys(sample.data);

    // ============================
    // 1. Detect if query looks like a code
    // ============================
    const normalized = query.trim().toUpperCase();
    const looksLikeCode =
      /^[A-Z]\d{2}(\.\d+)?$/.test(normalized) ||
      /^[A-Z0-9]{4,5}$/.test(normalized);

    if (looksLikeCode) {
      const codeField = fields.find(
        (f) =>
          f.toLowerCase() === "code" ||
          f.toLowerCase() === "hcpcs" ||
          f.toLowerCase() === "icd"
      );

      if (codeField) {
        const codeResults = await DatasetEntries.findAll({
          where: {
            dataset_id: datasetId,
            data: {
              [codeField]: { [Op.iLike]: `${normalized}%` },
            },
          },
          limit: 50,
        });

        if (codeResults.length > 0) {
          return res.json({
            mode: "code_match",
            results: codeResults,
          });
        }
      }
    }

    // ============================
    // 2. LLM expansion
    // ============================
    let expandedTerms = [];
    try {
      expandedTerms = await expandQuery(fields, dataset.type, query);
      expandedTerms = expandedTerms.slice(0, 4); // keep it tight
    } catch {
      expandedTerms = [];
    }

    // Always include original query
    expandedTerms.unshift(query);

    // ============================
    // 3. Convert each phrase into AND-word groups
    // ============================
    const STOPWORDS = new Set([
      "the",
      "and",
      "or",
      "of",
      "in",
      "on",
      "for",
      "to",
      "with",
      "a",
      "an",
      "other",
      "unspecified",
    ]);

    const phraseGroups = expandedTerms.map((phrase) =>
      phrase
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    );

    console.log("🔍 AND-GROUPS:", phraseGroups);

    // ============================
    // 4. Build conditions: each phrase group is ANDed
    // ============================
    const orConditions = [];

    for (const group of phraseGroups) {
      // AND together inside group
      const andConditions = group.map((word) => ({
        [Op.or]: fields.map((field) => ({
          data: { [field]: { [Op.iLike]: `%${word}%` } },
        })),
      }));

      orConditions.push({ [Op.and]: andConditions });
    }

    // ============================
    // 5. Final search
    // ============================
    const results = await DatasetEntries.findAll({
      where: {
        dataset_id: datasetId,
        [Op.or]: orConditions,
      },
      limit: 50,
    });

    console.log("RESULT COUNT →", results.length);

    return res.json({
      mode: "semantic_and_words",
      expandedTerms,
      results,
    });
  } catch (err) {
    console.error("Semantic search fatal error:", err);
    return res
      .status(500)
      .json({ message: "Search failed", error: err.message });
  }
};
