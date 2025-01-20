import { standardizeAndFilter } from '../utils/dataCleaner.js';
import fs from 'fs';
import Datasets from '../models/dataset.js';
import DatasetEntries from '../models/datasetEntries.js';
import DatasetUsage from '../models/datasetUsage.js';
import { logUserActivity } from './analyticsController.js';
import { parseDataset } from '../utils/datasetParser.js';
import { Op } from 'sequelize';

/**
 * Handles dataset upload by admin.
 * - Cleans and parses the uploaded dataset file.
 * - Inserts entries into the database.
 * - Logs the dataset upload activity.
 *
 * @param {object} req - HTTP request containing the dataset file and metadata.
 * @param {object} res - HTTP response object.
 */
export const uploadDataset = async (req, res) => {
    try {
        // Validate request body
        const { name, description, datasetType } = req.body;

        // Check if dataset type is valid
        if (!req.file) {
            return res.status(400).json({ message: 'File is required.' });
        }
        const inputFile = req.file.path;
        const cleanedFile = `${inputFile}_cleaned.txt`;

        // Standardize and filter the dataset
        await standardizeAndFilter(inputFile, cleanedFile);

        // Create a new dataset
        const dataset = await Datasets.create({
            name,
            description,
            type: datasetType,
            uploaded_by: req.user.id,
        });

        // Parse the dataset and insert entries
        const fileContent = fs.readFileSync(cleanedFile, 'utf-8');
        const rows = fileContent.split('\n').map(line => line.split('\t'));
        const parsedRows = parseDataset(datasetType, rows);
        const failedEntries = [];

        // Insert entries
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
            // Log failed entries
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



/**
 * Deletes a dataset and its associated records.
 * - Removes dataset entries and usage logs.
 * - Logs the dataset deletion activity.
 *
 * @param {object} req - HTTP request containing the dataset ID.
 * @param {object} res - HTTP response object.
 */
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
            `Deleted dataset: ${dataset.name}`,
            req.ip
        );

        res.status(200).json({ message: 'Dataset deleted successfully' });
    } catch (error) {
        console.error('Error deleting dataset:', error.message);
        res.status(500).json({ message: 'Failed to delete dataset', error: error.message });
    }
};




/**
 * Fetches dataset entries with optional search and pagination.
 * - Supports filtering entries based on search term.
 * - Logs dataset view or search activity.
 *
 * @param {object} req - HTTP request containing dataset ID, search term, and pagination details.
 * @param {object} res - HTTP response object.
 */
export const getDatasetEntries = async (req, res) => {
    try {
        // Fetch dataset entries with pagination
        const { datasetId } = req.params;
        const { searchTerm = '', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // Fetch the dataset to check if it exists
        const dataset = await Datasets.findByPk(datasetId);
        if (!dataset) {
            console.warn(`Dataset not found (ID: ${datasetId}, User: ${req.user.id})`);
            return res.status(404).json({ message: 'Dataset not found' });
        }
        // Log dataset view or search activity
        if (searchTerm == ''){
            await logUserActivity(req.user.id, 'view_dataset', `Viewed dataset: ${dataset.name}`, req.ip);
        } else {
            await logDatasetUsage(datasetId, 'search', searchTerm || null, req.user.id);
        }

        // Fetch dataset entries
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

        // Fetch entries with search term and pagination
        const entries = await DatasetEntries.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit, 10),
            offset,
            order: [['created_at', 'DESC']],
        });

        // Return paginated dataset entries
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
