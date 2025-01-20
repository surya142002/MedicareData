import { standardizeAndFilter } from '../utils/dataCleaner.js';
import fs from 'fs';
import Datasets from '../models/dataset.js';
import DatasetEntries from '../models/datasetEntries.js';
import DatasetUsage from '../models/datasetUsage.js';
import { logUserActivity, logDatasetUsage } from './analyticsController.js';
import { parseDataset } from '../utils/datasetParser.js';
import { Op } from 'sequelize';


/**
 * Uploads a new dataset and parses its entries.
 * 
 * @param {Object} req - The request object containing dataset information and the uploaded file.
 * @param {Object} res - The response object.
 */
export const uploadDataset = async (req, res) => {
    try {
        // Extract dataset details from request body
        const { name, description, datasetType } = req.body;

        // Validate file upload
        if (!req.file) {
            return res.status(400).json({ message: 'File is required.' });
        }

        // Process the uploaded file
        const inputFile = req.file.path;
        const cleanedFile = `${inputFile}_cleaned.txt`;

        // Standardize and filter the data
        await standardizeAndFilter(inputFile, cleanedFile);

        // Create a new dataset record
        const dataset = await Datasets.create({
            name,
            description,
            type: datasetType,
            uploaded_by: req.user.id,
        });


        // Log dataset upload
        await logDatasetUsage(dataset.name, 'upload', null, req.user.id);

        // Read the cleaned file and parse the data
        const fileContent = fs.readFileSync(cleanedFile, 'utf-8');
        const rows = fileContent.split('\n').map(line => line.split('\t'));
        const parsedRows = parseDataset(datasetType, rows);

        // Insert the parsed data into the database
        const failedEntries = [];
        for (const row of parsedRows) {
            try {
                // Insert each row as a new entry
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
        }


        res.status(201).json({ message: 'Dataset uploaded successfully', dataset });
    } catch (error) {
        console.error('Error uploading dataset:', error);
        res.status(500).json({ message: 'Failed to upload dataset', error: error.message });
    }
};


/**
 * Deletes a dataset and its associated entries and logs.
 * 
 * @param {Object} req - The request object containing the dataset ID.
 * @param {Object} res - The response object.
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
 * Fetches entries of a dataset with optional search and pagination.
 * 
 * @param {Object} req - The request object containing dataset ID, search term, and pagination info.
 * @param {Object} res - The response object.
 */
export const getDatasetEntries = async (req, res) => {
    try {
        // Extract dataset ID and query parameters
        const { datasetId } = req.params;
        const { searchTerm = '', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // Fetch the dataset to check if it exists
        const dataset = await Datasets.findByPk(datasetId);
        if (!dataset) {
            console.warn(`Dataset not found (ID: ${datasetId}, User: ${req.user.id})`);
            return res.status(404).json({ message: 'Dataset not found' });
        }
        // Log user activity
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

        // Fetch dataset entries with search and pagination
        const entries = await DatasetEntries.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit, 10),
            offset,
            order: [['created_at', 'DESC']],
        });

        // Send the dataset entries
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
