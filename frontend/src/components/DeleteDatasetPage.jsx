import React from "react";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const DeleteDatasetPage = () => {
    // State variables
    const [datasets, setDatasets] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Fetch datasets from the backend
    useEffect(() => {
        const fetchDatasets = async () => {
            try {
                // Fetch datasets from the API
                const response = await api.get('/datasets');
                setDatasets(response.data);
            } catch (error) {
                console.error('Failed to fetch datasets:', error);
            }
        };

        // Call the fetchDatasets function
        fetchDatasets();
    }, []);

    // Handle dataset deletion
    const handleDelete = async (datasetId) => {
        // Confirm the deletion
        const confirmDelete = window.confirm('Are you sure you want to delete this dataset?');
        if (!confirmDelete) return;

        try {
            // Delete the dataset
            const response = await api.delete(`/datasets/${datasetId}`);
            setMessage(response.data.message);
            setDatasets(datasets.filter(dataset => dataset.id !== datasetId));
        } catch (error) {
            console.error('Failed to delete dataset:', error);
        }
    };

    return (
        <div className="delete-page">
            {/* Back button */}
            <button className="back-button" onClick={() => navigate('/datasets')}>Back</button>
            <h1 className="page-title">Delete Dataset</h1>
            {message && <p className="status-message">{message}</p>}
            {/* List of datasets */}
            <ul className="datasets-list">
                {datasets.map(dataset => (
                    <li key={dataset.id} className="dataset-item">
                        {dataset.name}
                        <button
                            className="auth-form-button"
                            onClick={() => handleDelete(dataset.id)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DeleteDatasetPage;
