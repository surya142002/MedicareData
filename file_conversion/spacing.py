import re
import chardet

def detect_encoding(file_path):
    """Detect the file encoding."""
    with open(file_path, 'rb') as f:
        result = chardet.detect(f.read())
    return result['encoding']

def standardize_and_filter(input_file, output_file, delimiter="\t"):
    """
    Standardize the spacing between codes and descriptions in a text file
    and filter out invalid or unwanted lines.

    Args:
        input_file (str): Path to the input file.
        output_file (str): Path to save the standardized file.
        delimiter (str): Delimiter to use between code and description.
    """
    # Lines or phrases to exclude
    unwanted_phrases = [
        "future CPT", "the physician", "INCLUDE", "following codes",
        "vaccine codes", "eligible for use",
        "1CPT codes, descriptions and other data only are copyright",
        "EPO AND OTHER DIALYSIS-RELATED DRUGS",
        "This code list is effective January 1, 2025",
        "LIST OF CPT1/HCPCS CODES USED TO DEFINE CERTAIN DESIGNATED HEALTH SERVICE CATEGORIES2 UNDER SECTION 1877 OF THE SOCIAL SECURITY ACT"
    ]

    try:
        # Detect encoding
        encoding = detect_encoding(input_file)
        
        with open(input_file, 'r', encoding=encoding) as infile, open(output_file, 'w', encoding='utf-8') as outfile:
            for line in infile:
                line = line.strip()
                
                # Skip empty lines or lines containing unwanted phrases
                if not line or any(phrase.lower() in line.lower() for phrase in unwanted_phrases):
                    continue
                
                # Extract code and description using regex
                match = re.match(r"^(\S+)\s+(.*)", line)
                if match:
                    code, description = match.groups()
                    # Filter out descriptions that seem like full paragraphs or nonsensical lines
                    if len(code) <= 7 and len(description.split()) > 2:
                        outfile.write(f"{code}{delimiter}{description}\n")
                else:
                    print(f"Skipped malformed line: {line}")
        print(f"Processed file saved to: {output_file}")
    except Exception as e:
        print(f"Error processing file: {e}")

if __name__ == "__main__":
    # Paths to input and output files
    icd10cm_input = "icd10cm_codes_2025.txt"
    icd10cm_output = "icd10cm_codes_2025_standardized.txt"
    hcpcs_input = "HCPCS_codes_2025.txt"
    hcpcs_output = "HCPCS_codes_2025_standardized.txt"

    # Standardize both files
    standardize_and_filter(icd10cm_input, icd10cm_output)
    standardize_and_filter(hcpcs_input, hcpcs_output)
