import { standardizeAndFilter } from '../utils/dataCleaner.js';
import path from 'path';
import fs from 'fs';
import Datasets from '../models/dataset.js';
import DatasetEntries from '../models/datasetEntries.js';
import { parseDataset } from '../utils/datasetParser.js'; // Import your parsing utility
import { Op } from 'sequelize';

// Upload a new dataset
export const uploadDataset = async (req, res) => {
    try {
        const { name, description, datasetType } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'File is required.' });
        }

        const inputFile = req.file.path;
        const cleanedFile = `${inputFile}_cleaned.txt`;

        // Clean and standardize the dataset
        await standardizeAndFilter(inputFile, cleanedFile);

        const dataset = await Datasets.create({
            name,
            description,
            type: datasetType,
            uploaded_by: req.user.id,
        });

        // Parse the cleaned file and insert data
        const fileContent = fs.readFileSync(cleanedFile, 'utf-8');
        const rows = fileContent.split('\n').map(line => line.split('\t'));
        const parsedRows = parseDataset(datasetType, rows);

        const failedEntries = [];
        for (const row of parsedRows) {
            try {
                await DatasetEntries.create({
                    dataset_id: dataset.id,
                    data: row,
                });
            } catch (error) {
                failedEntries.push({ row, error: error.message });
            }
        }

        // Log failed entries
        if (failedEntries.length > 0) {
            console.error(`Failed to insert ${failedEntries.length} entries:`);
            failedEntries.forEach(failed =>
                console.error(`Entry: ${JSON.stringify(failed.row)}, Error: ${failed.error}`)
            );
        } else {
            console.log(`All ${parsedRows.length} entries successfully inserted.`);
        }

        res.status(201).json({ message: 'Dataset uploaded successfully', dataset });
    } catch (error) {
        console.error('Error uploading dataset:', error);
        res.status(500).json({ message: 'Failed to upload dataset', error: error.message });
    }
};


// delete a dataset by ID
export const deleteDataset = async (req, res) => {
    try {
        const { datasetId } = req.params;
        await Datasets.destroy({ where: { id: datasetId } });
        res.status(200).json({ message: 'Dataset deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete dataset', error: error.message });
    }
};



// Fetch dataset entries with search and pagination
export const getDatasetEntries = async (req, res) => {
    try {
        const { datasetId } = req.params;
        const { searchTerm = '', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        console.log(`Fetching dataset entries for dataset: ${datasetId}, page: ${page}, searchTerm: "${searchTerm}"`);

        // Build the where condition dynamically
        const whereCondition = {
            dataset_id: datasetId,
            ...(searchTerm && {
                data: {
                    [Op.or]: [
                        { code: { [Op.iLike]: `${searchTerm}%` } }, // Code starts with searchTerm
                        { description: { [Op.iLike]: `%${searchTerm}%` } }, // Description contains searchTerm
                    ],
                },
            }),
        };

        const entries = await DatasetEntries.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit, 10),
            offset,
            order: [['created_at', 'DESC']], // Optional: order entries by creation date
        });

        console.log(`Found ${entries.count} entries for dataset: ${datasetId}`);

        res.status(200).json({
            entries: entries.rows,
            count: entries.count,
            currentPage: parseInt(page, 10),
            totalPages: Math.ceil(entries.count / limit),
        });
    } catch (error) {
        console.error('Error fetching dataset entries:', error);
        res.status(500).json({ message: 'Failed to fetch dataset entries' });
    }
};
