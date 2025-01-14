import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const UploadDatasetPage = () => {
    const [formData, setFormData] = useState({ name: '', description: '', datasetType: '', file: null });
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false); // Loading state
    const [fileName, setFileName] = useState(''); // State for file name display
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, file });
        setFileName(file ? file.name : ''); // Update file name
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true); // Start loading
        try {
            const uploadData = new FormData();
            uploadData.append('name', formData.name);
            uploadData.append('description', formData.description);
            uploadData.append('datasetType', formData.datasetType);
            uploadData.append('file', formData.file);

            const response = await api.post('/datasets/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to upload dataset');
        } finally {
            setIsUploading(false); // Stop loading
        }
    };

    return (
        <div className="upload-page">
            <button className="back-button" onClick={() => navigate('/datasets')}>Back</button>
            <div className="upload-container">
                <h1 className="page-title">Upload Dataset</h1>
                {isUploading && <p className="loading-message">Uploading...</p>}
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
                    <div className="auth-form-file">
                        <label htmlFor="file-input" className="file-input-label">Choose File</label>
                        <input
                            id="file-input"
                            type="file"
                            className="custom-file-input"
                            accept=".txt"
                            onChange={handleFileChange}
                            required
                        />
                    </div>
                    <span>{fileName || 'No file selected'}</span>
                    <button type="submit" className="auth-form-button">Upload</button>
                </form>
            </div>
        </div>
    );
};

export default UploadDatasetPage;
