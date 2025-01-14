export const parseDataset = (datasetType, rows) => {
    switch (datasetType) {
        case 'ICD-10-CM':
            return rows.map(row => ({
                code: row[0],
                description: row[1],
            }));
        case 'HCPCS':
            return rows.map(row => ({
                code: row[0],
                description: row[1],
            }));
        case 'RVU':
            return rows.map(row => ({
                code: row[0],
                value: row[1],
                description: row[2],
            }));
        case 'FeeSchedules':
            return rows.map(row => ({
                code: row[0],
                fee: row[1],
                description: row[2],
            }));
        case 'MUE Edits':
            return rows.map(row => ({
                code: row[0],
                units: row[1],
                edits: row[2],
            }));
        case 'LMRP':
            return rows.map(row => ({
                policyId: row[0],
                description: row[1],
            }));
        default:
            throw new Error(`Unsupported dataset type: ${datasetType}`);
    }
};
