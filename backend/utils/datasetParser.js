/**
 * Parses rows of data based on the dataset type and maps them to a structured format.
 * Supports various dataset types like ICD-10-CM, HCPCS, RVU, FeeSchedules, etc.
 *
 * Right now this is best suited for just a few dataset types, but it can be extended to support more.
 * AKA outside of ICD and HCPCS, this is not very accurate.
 *
 * @param {string} datasetType - The type of dataset (e.g., ICD-10-CM, HCPCS).
 * @param {Array} rows - Array of rows where each row is an array of fields (parsed from the dataset file).
 * @returns {Array} An array of parsed dataset entries with structured fields.
 * @throws {Error} Throws an error if the dataset type is unsupported.
 */
/**
 * Parses rows of data based on the dataset type and maps them to a structured format.
 * Supports various dataset types like ICD-10-CM, HCPCS, RVU, FeeSchedules, etc.
 *
 * @param {string} datasetType - The type of dataset (e.g., ICD-10-CM, HCPCS, RVU).
 * @param {Array} rows - Array of rows where each row is an array of fields.
 * @returns {Array} An array of parsed dataset entries with structured fields.
 */
export const parseDataset = (datasetType, rows) => {
  switch (datasetType) {
    case "ICD-10-CM":
    case "HCPCS":
      return rows.map((row) => ({
        code: row[0],
        description: row[1] || "No description available",
      }));

    case "RVU":
      return rows.map((row) => ({
        code: row[0],
        value: row[1] || "N/A",
        description: row[2] || "No description available",
      }));

    case "FeeSchedules":
      return rows.map((row) => ({
        code: row[0],
        fee: row[1] || "N/A",
        description: row[2] || "No description available",
      }));

    case "MUE Edits":
      return rows.map((row) => ({
        code: row[0],
        units: row[1] || "N/A",
        edits: row[2] || "No description available",
      }));

    case "LMRP":
      return rows.map((row) => ({
        policyId: row[0],
        description: row[1] || "No description available",
      }));

    default:
      throw new Error(`Unsupported dataset type: ${datasetType}`);
  }
};
