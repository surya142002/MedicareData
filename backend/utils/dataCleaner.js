import fs from 'fs';
import chardet from 'chardet';

// Unwanted phrases to filter out
const unwantedPhrases = [
    "future CPT", "the physician", "INCLUDE", "following codes",
    "vaccine codes", "eligible for use",
    "1CPT codes, descriptions and other data only are copyright",
    "EPO AND OTHER DIALYSIS-RELATED DRUGS",
    "This code list is effective January 1, 2025",
    "LIST OF CPT1/HCPCS CODES USED TO DEFINE CERTAIN DESIGNATED HEALTH SERVICE CATEGORIES2 UNDER SECTION 1877 OF THE SOCIAL SECURITY ACT"
];

// Detect file encoding
// Map of valid encodings
const validEncodings = ['utf-8', 'utf8', 'ascii', 'latin1', 'base64'];

export const detectEncoding = (filePath) => {
    const content = fs.readFileSync(filePath);
    const detectedEncoding = chardet.detect(content);

    // Normalize encoding
    const normalizedEncoding = detectedEncoding ? detectedEncoding.toLowerCase() : 'utf-8';

    // Fallback to 'utf-8' if the encoding is not valid
    if (!validEncodings.includes(normalizedEncoding)) {
        console.warn(`Invalid encoding detected: ${detectedEncoding}. Defaulting to utf-8.`);
        return 'utf-8';
    }

    return normalizedEncoding;
};

// Standardize and filter dataset lines
export const standardizeAndFilter = async (inputFile, outputFile, delimiter = "\t") => {
    let inputContent;

    try {
        const encoding = detectEncoding(inputFile);

        // Read the file with detected or fallback encoding
        inputContent = fs.readFileSync(inputFile, { encoding });
    } catch (error) {
        console.error(`Error reading file. Retrying with utf-8. Error: ${error.message}`);
        inputContent = fs.readFileSync(inputFile, { encoding: 'utf-8' });
    }

    try {
        const lines = inputContent.split('\n').filter(line => line.trim() !== '');

        const cleanedLines = lines
            .map(line => line.trim())
            .filter(line => !unwantedPhrases.some(phrase => line.toLowerCase().includes(phrase.toLowerCase())))
            .map(line => {
                // Use JavaScript's regex to match and extract code and description
                const match = line.match(/^(\S+)\s+(.*)/);
                if (match) {
                    const [_, code, description] = match; // Destructure matched groups
                    if (code.length <= 7 && description.split(' ').length > 2) {
                        return `${code}${delimiter}${description}`;
                    }
                }
                return null;
            })
            .filter(Boolean);

        fs.writeFileSync(outputFile, cleanedLines.join('\n'), { encoding: 'utf-8' });
        return outputFile;
    } catch (error) {
        console.error(`Error in standardizeAndFilter: ${error.message}`);
        throw error;
    }
};
