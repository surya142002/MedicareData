import { standardizeAndFilter } from '../utils/dataCleaner.js';
import path from 'path';
import fs from 'fs';
import Datasets from '../models/dataset.js';
import DatasetEntries from '../models/datasetEntries.js';
import DatasetUsage from '../models/datasetUsage.js';
import { logUserActivity } from './analyticsController.js'; // Ensure correct path
import { parseDataset } from '../utils/datasetParser.js'; // Import your parsing utility
import { Op } from 'sequelize';

export const logDatasetUsage = async (datasetId, actionType, searchTerm) => {
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

        // Log dataset upload
        await logDatasetUsage(dataset.id, 'upload', null, req.user.id);

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

        // Fetch the dataset to check if it exists
        const dataset = await Datasets.findByPk(datasetId);
        if (!dataset) {
            return res.status(404).json({ message: 'Dataset not found' });
        }

        // Delete associated records in DatasetUsage
        await DatasetUsage.destroy({ where: { dataset_id: datasetId } });

        // Delete associated records in DatasetEntries (if applicable)
        await DatasetEntries.destroy({ where: { dataset_id: datasetId } });

        // Delete the dataset
        await Datasets.destroy({ where: { id: datasetId } });

        // Log user activity
        await logUserActivity(
            req.user.id,
            'dataset_delete',
            `Deleted dataset with ID: ${datasetId}`,
            req.ip
        );

        res.status(200).json({ message: 'Dataset deleted successfully' });
    } catch (error) {
        console.error('Error deleting dataset:', error.message);
        res.status(500).json({ message: 'Failed to delete dataset', error: error.message });
    }
};




// Fetch dataset entries with search and pagination
export const getDatasetEntries = async (req, res) => {
    try {
        const { datasetId } = req.params;
        const { searchTerm = '', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const dataset = await Datasets.findByPk(datasetId);
        if (!dataset) {
            console.warn(`Dataset not found (ID: ${datasetId}, User: ${req.user.id})`);
            return res.status(404).json({ message: 'Dataset not found' });
        }

        await logDatasetUsage(datasetId, 'search', searchTerm || null, req.user.id);

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

        res.status(200).json({
            entries: entries.rows,
            count: entries.count,
            currentPage: parseInt(page, 10),
            totalPages: Math.ceil(entries.count / limit),
        });
    } catch (error) {
        console.error(`Error fetching dataset entries (Dataset ID: ${datasetId}):`, error.message);
        res.status(500).json({ message: 'Failed to fetch dataset entries', error: error.message });
    }
};
