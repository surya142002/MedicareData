import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const UploadDatasetPage = () => {
    const [formData, setFormData] = useState({ name: '', description: '', datasetType: '', file: null });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, file }); // Store the file directly
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const uploadData = new FormData(); // Use FormData to handle file uploads
            uploadData.append('name', formData.name);
            uploadData.append('description', formData.description);
            uploadData.append('datasetType', formData.datasetType);
            uploadData.append('file', formData.file); // Append the file

            const response = await api.post('/datasets/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }, // Ensure proper headers
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to upload dataset');
        }
    };

    return (
        <div className="upload-page">
            <button className="back-button" onClick={() => navigate('/datasets')}>Back</button>
            <h1 className="page-title">Upload Dataset</h1>
            {message && <p className="status-message">{message}</p>}
            <form onSubmit={handleSubmit} className="auth-form">
                <label className="auth-form-label">Dataset Name:</label>
                <input
                    type="text"
                    name="name"
                    onChange={handleChange}
                    required
                    className="auth-form-input"
                />
                <label className="auth-form-label">Description:</label>
                <textarea
                    name="description"
                    onChange={handleChange}
                    className="auth-form-input"
                />
                <label className="auth-form-label">Dataset Type:</label>
                <select
                    name="datasetType"
                    onChange={handleChange}
                    required
                    className="auth-form-input"
                >
                    <option value="">Select Type</option>
                    <option value="ICD-10-CM">ICD-10-CM</option>
                    <option value="HCPCS">HCPCS</option>
                    <option value="RVU">RVU</option>
                    <option value="FeeSchedules">Fee Schedules</option>
                    <option value="MUE Edits">MUE Edits</option>
                    <option value="LMRP">Current LMRP</option>
                </select>
                <label className="auth-form-label">Upload File:</label>
                <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileChange}
                    required
                    className="auth-form-input"
                />
                <button type="submit" className="auth-form-button">Upload</button>
            </form>
        </div>
    );
};

export default UploadDatasetPage;
