import re
import chardet
import psycopg2
import uuid
import json
from datetime import datetime

# Database settings
DB_SETTINGS = {
    'dbname': 'medidatabase',
    'user': 'surya',
    'password': 'password1',
    'host': 'localhost',
    'port': '5432'
}

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
    unwanted_phrases = [
        "future CPT", "the physician", "INCLUDE", "following codes",
        "vaccine codes", "eligible for use",
        "1CPT codes, descriptions and other data only are copyright",
        "EPO AND OTHER DIALYSIS-RELATED DRUGS",
        "This code list is effective January 1, 2025",
        "LIST OF CPT1/HCPCS CODES USED TO DEFINE CERTAIN DESIGNATED HEALTH SERVICE CATEGORIES2 UNDER SECTION 1877 OF THE SOCIAL SECURITY ACT"
    ]

    try:
        encoding = detect_encoding(input_file)
        with open(input_file, 'r', encoding=encoding) as infile, open(output_file, 'w', encoding='utf-8') as outfile:
            for line in infile:
                line = line.strip()
                if not line or any(phrase.lower() in line.lower() for phrase in unwanted_phrases):
                    continue
                match = re.match(r"^(\S+)\s+(.*)", line)
                if match:
                    code, description = match.groups()
                    if len(code) <= 7 and len(description.split()) > 2:
                        outfile.write(f"{code}{delimiter}{description}\n")
                else:
                    print(f"Skipped malformed line: {line}")
        print(f"Processed file saved to: {output_file}")
    except Exception as e:
        print(f"Error processing file: {e}")

def ensure_user_exists():
    """Ensure a user exists in the Users table and return the user ID."""
    try:
        conn = psycopg2.connect(**DB_SETTINGS)
        cur = conn.cursor()
        cur.execute('SELECT id FROM "Users" LIMIT 1')
        user = cur.fetchone()
        if not user:
            user_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO "Users" (id, email, password_hash, role, created_at)
                VALUES (%s, %s, %s, %s, %s)
            """, (user_id, 'default@user.com', 'hashed_password', 'admin', datetime.now()))
            conn.commit()
            print(f"Default user created with ID: {user_id}")
        else:
            user_id = user[0]
        return user_id
    except Exception as e:
        print(f"Error ensuring user exists: {e}")
    finally:
        cur.close()
        conn.close()

def insert_data(dataset_name, dataset_description, file_path):
    """Insert dataset metadata and entries into the database."""
    try:
        conn = psycopg2.connect(**DB_SETTINGS)
        cur = conn.cursor()
        uploaded_by = ensure_user_exists()
        dataset_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO "Datasets" (id, name, description, file_path, uploaded_by, uploaded_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (dataset_id, dataset_name, dataset_description, file_path, uploaded_by, datetime.now()))
        print(f"Inserted dataset '{dataset_name}' with ID {dataset_id}")
        with open(file_path, 'r', encoding='utf-8') as file:
            data = [line.strip().split("\t") for line in file]
            for i, entry in enumerate(data):
                try:
                    entry_id = str(uuid.uuid4())
                    code, description = entry
                    cur.execute("""
                        INSERT INTO "DatasetEntries" (id, dataset_id, data, created_at)
                        VALUES (%s, %s, %s, %s)
                    """, (entry_id, dataset_id, json.dumps({'code': code, 'description': description}), datetime.now()))
                except Exception as e:
                    print(f"Error inserting entry {i + 1}: {entry}, Error: {e}")
        conn.commit()
        print(f"Inserted {len(data)} entries into dataset '{dataset_name}'")
    except Exception as e:
        print(f"Error inserting data: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    # Input and output file paths
    icd10cm_input = "icd10cm_codes_2025.txt"
    icd10cm_output = "icd10cm_codes_2025_standardized.txt"
    hcpcs_input = "HCPCS_codes_2025.txt"
    hcpcs_output = "HCPCS_codes_2025_standardized.txt"

    # Standardize files
    standardize_and_filter(icd10cm_input, icd10cm_output)
    standardize_and_filter(hcpcs_input, hcpcs_output)

    # Insert data into the database
    insert_data(
        dataset_name="ICD-10-CM 2025",
        dataset_description="International Classification of Diseases, 10th Revision, Clinical Modification",
        file_path=icd10cm_output
    )
    insert_data(
        dataset_name="HCPCS 2025",
        dataset_description="Healthcare Common Procedure Coding System",
        file_path=hcpcs_output
    )
