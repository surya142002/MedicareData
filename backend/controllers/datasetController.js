import { standardizeAndFilter } from '../utils/dataCleaner.js';
import path from 'path';
import fs from 'fs';
import Datasets from '../models/dataset.js';
import DatasetEntries from '../models/datasetEntries.js';
import DatasetUsage from '../models/datasetUsage.js';
import { parseDataset } from '../utils/datasetParser.js'; // Import your parsing utility
import { Op } from 'sequelize';

export const logDatasetUsage = async (datasetId, actionType, searchTerm = null) => {
    try {
        await DatasetUsage.create({
            dataset_id: datasetId,
            action_type: actionType,
            search_term: searchTerm,
        });
    } catch (error) {
        console.error('Error logging dataset usage:', error.message);
    }
};

// Upload a new dataset
export const uploadDataset = async (req, res) => {
    try {
        const { name, description, datasetType } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'File is required.' });
        }

        const inputFile = req.file.path;
        const cleanedFile = `${inputFile}_cleaned.txt`;

        await standardizeAndFilter(inputFile, cleanedFile);

        const dataset = await Datasets.create({
            name,
            description,
            type: datasetType,
            uploaded_by: req.user.id,
        });

        await logDatasetUsage(dataset.id, 'upload');

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

        if (failedEntries.length > 0) {
            console.error(`Failed to insert ${failedEntries.length} entries:`);
            failedEntries.forEach(failed =>
                console.error(`Entry: ${JSON.stringify(failed.row)}, Error: ${failed.error}`)
            );
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

        // Log the search action
        await logDatasetUsage(datasetId, 'search', searchTerm);

        // Build the where condition dynamically
        const whereCondition = {
            dataset_id: datasetId,
            ...(searchTerm && {
                data: {
                    [Op.or]: [
                        { code: { [Op.iLike]: `${searchTerm}%` } },
                        { description: { [Op.iLike]: `%${searchTerm}%` } },
                    ],
                },
            }),
        };

        const entries = await DatasetEntries.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit, 10),
            offset,
            order: [['created_at', 'DESC']],
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
        res.status(500).json({ message: 'Failed to fetch dataset entries', error: error.message });
    }
};

