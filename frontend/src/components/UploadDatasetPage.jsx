import React, { useState } from 'react';
import api from '../utils/api';

const UploadDatasetPage = () => {
    const [formData, setFormData] = useState({ name: '', description: '', datasetType: '', rows: [] });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            const rows = JSON.parse(reader.result);
            setFormData({ ...formData, rows });
        };

        reader.readAsText(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/datasets/upload', formData);
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to upload dataset');
        }
    };

    return (
        <div className="upload-page">
            <h1>Upload Dataset</h1>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Dataset Name:
                    <input type="text" name="name" onChange={handleChange} required />
                </label>
                <label>
                    Description:
                    <textarea name="description" onChange={handleChange} />
                </label>
                <label>
                    Dataset Type:
                    <input type="text" name="datasetType" onChange={handleChange} required />
                </label>
                <label>
                    Upload File:
                    <input type="file" accept=".json" onChange={handleFileChange} required />
                </label>
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default UploadDatasetPage;
