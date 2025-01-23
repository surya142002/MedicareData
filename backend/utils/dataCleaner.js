import fs from "fs";
import chardet from "chardet";

// Unwanted phrases to filter out (CONSIDERS ICD AND HCPCS DATASETS)
const unwantedPhrases = [
  "future CPT",
  "the physician",
  "INCLUDE",
  "following codes",
  "vaccine codes",
  "eligible for use",
  "1CPT codes, descriptions and other data only are copyright",
  "EPO AND OTHER DIALYSIS-RELATED DRUGS",
  "This code list is effective January 1, 2025",
  "LIST OF CPT1/HCPCS CODES USED TO DEFINE CERTAIN DESIGNATED HEALTH SERVICE CATEGORIES2 UNDER SECTION 1877 OF THE SOCIAL SECURITY ACT",
];

// Map of valid encodings
const validEncodings = ["utf-8", "utf8", "ascii", "latin1", "base64"];

/**
 * Detects the encoding of a given file and validates it.
 * Falls back to 'utf-8' if the detected encoding is invalid.
 *
 * @param {string} filePath - The path to the file whose encoding is to be detected.
 * @returns {string} The detected or fallback encoding.
 */
export const detectEncoding = (filePath) => {
  const content = fs.readFileSync(filePath);
  const detectedEncoding = chardet.detect(content);

  // Normalize encoding
  const normalizedEncoding = detectedEncoding
    ? detectedEncoding.toLowerCase()
    : "utf-8";

  // Fallback to 'utf-8' if the encoding is not valid
  if (!validEncodings.includes(normalizedEncoding)) {
    console.warn(
      `Invalid encoding detected: ${detectedEncoding}. Defaulting to utf-8.`
    );
    return "utf-8";
  }

  return normalizedEncoding;
};

/**
 * Cleans and standardizes dataset lines by:
 * - Filtering out unwanted phrases.
 * - Extracting and formatting code-description pairs.
 * - Writing cleaned data to a new file.
 *
 * ONLY ICD AND HCPCS DATASETS ARE CONSIDERED IN THIS IMPLEMENTATION.
 *
 * @param {string} inputFile - Path to the input dataset file.
 * @param {string} outputFile - Path to the output cleaned dataset file.
 * @param {string} delimiter - Delimiter to separate fields (default: tab).
 * @returns {string} Path to the cleaned dataset file.
 * @throws {Error} Throws an error if any file operation fails.
 */
export const standardizeAndFilter = async (
  inputFile,
  outputFile,
  delimiter = "\t"
) => {
  let inputContent;

  try {
    // Detect file encoding and read content
    const encoding = detectEncoding(inputFile);
    // Read the file with detected or fallback encoding
    inputContent = fs.readFileSync(inputFile, { encoding });
  } catch (error) {
    console.error(
      `Error reading file. Retrying with utf-8. Error: ${error.message}`
    );
    inputContent = fs.readFileSync(inputFile, { encoding: "utf-8" });
  }

  try {
    // Split the file content into lines and remove empty lines
    const lines = inputContent.split("\n").filter((line) => line.trim() !== "");

    // Clean lines by removing unwanted phrases and formatting them
    const cleanedLines = lines
      .map((line) => line.trim())
      .filter(
        (line) =>
          !unwantedPhrases.some((phrase) =>
            line.toLowerCase().includes(phrase.toLowerCase())
          )
      )
      .map((line) => {
        // Use JavaScript's regex to match and extract code and description
        const match = line.match(/^(\S+)\s+(.*)/);
        if (match) {
          // Extract code and description using regex groups
          const [_, code, description] = match; // Destructure matched groups
          // Include only entries with valid codes and meaningful descriptions
          if (code.length <= 7 && description.split(" ").length > 2) {
            return `${code}${delimiter}${description}`;
          }
        }
        return null;
      })
      .filter(Boolean); // Remove null entries

    // Write cleaned data to a new file
    fs.writeFileSync(outputFile, cleanedLines.join("\n"), {
      encoding: "utf-8",
    });
    return outputFile;
  } catch (error) {
    console.error(`Error in standardizeAndFilter: ${error.message}`);
    throw error;
  }
};
