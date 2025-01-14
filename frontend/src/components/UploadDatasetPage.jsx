import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const UploadDatasetPage = () => {
    const [formData, setFormData] = useState({ name: '', description: '', datasetType: '', rows: [] });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

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
                <input
                    type="text"
                    name="datasetType"
                    onChange={handleChange}
                    required
                    className="auth-form-input"
                />
                <label className="auth-form-label">Upload File:</label>
                <input
                    type="file"
                    accept=".json"
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
