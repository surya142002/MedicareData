import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const DeleteDatasetPage = () => {
    const [datasets, setDatasets] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchDatasets = async () => {
            try {
                const response = await api.get('/datasets');
                setDatasets(response.data);
            } catch (error) {
                console.error('Failed to fetch datasets:', error);
            }
        };

        fetchDatasets();
    }, []);

    const handleDelete = async (datasetId) => {
        try {
            const response = await api.delete(`/datasets/${datasetId}`);
            setMessage(response.data.message);
            setDatasets(datasets.filter(dataset => dataset.id !== datasetId));
        } catch (error) {
            setMessage('Failed to delete dataset');
        }
    };

    return (
        <div className="delete-page">
            <h1>Delete Dataset</h1>
            {message && <p>{message}</p>}
            <ul>
                {datasets.map(dataset => (
                    <li key={dataset.id}>
                        {dataset.name}
                        <button onClick={() => handleDelete(dataset.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DeleteDatasetPage;
