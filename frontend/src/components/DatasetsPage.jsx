import React from "react";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import DatasetTable from './DatasetsTable';

const DatasetsPage = ({ onLogout }) => {
  // State variables
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('role') === 'admin'; // Check role from localStorage

  // Fetch datasets on component mount
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        // Fetch datasets from the API
        const response = await api.get('/datasets');
        console.log('Fetched datasets:', response.data);
        setDatasets(response.data);
      } catch (error) {
        console.error('Error fetching datasets:', error);
        if (error.response && error.response.status === 401) {
          onLogout(); // Log out if unauthorized
        }
      }
    };

    // Call the fetchDatasets function
    fetchDatasets();
  }, [onLogout]);


  // Handle dataset button click
  const handleDatasetClick = (dataset) => {
    setSelectedDataset(dataset);
  };

  // Handle logout button click
  const handleLogout = () => {
    onLogout(); // Trigger logout callback
    navigate('/login', { replace: true }); // Ensure immediate redirection
  };

  // Render the component
  return (
    <div className="datasets-page">
      {/* Header with buttons */}
      <div className="header-buttons">
        {isAdmin && (
          <>
            <button className="admin-button" onClick={() => navigate('/upload')}>
              Upload Dataset
            </button>
            <button className="admin-button" onClick={() => navigate('/delete')}>
              Delete Dataset
            </button>
            <button className="admin-button" onClick={() => navigate('/analytics')}>
              Analytics
            </button>
          </>
        )}
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Datasets list */}
      <div className="header">
        <h1 className="header-title">Available Datasets</h1>
      </div>

      <div className="datasets-list">
        {datasets.length > 0 ? (
          datasets.map((dataset) => (
            <button
              key={dataset.id}
              className="dataset-button"
              onClick={() => handleDatasetClick(dataset)}
            >
              {dataset.name}
            </button>
          ))
        ) : (
          <p>No datasets available.</p>
        )}
      </div>

      {/* Dataset table */}
      {selectedDataset && (
        <div className="dataset-table-container">
          <DatasetTable datasetId={selectedDataset.id} datasetName={selectedDataset.name} />
        </div>
      )}
    </div>
  );
};

export default DatasetsPage;
