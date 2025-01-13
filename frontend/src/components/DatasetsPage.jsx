import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import DatasetTable from './DatasetsTable';

const DatasetsPage = ({ onLogout }) => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await api.get('/datasets');
        setDatasets(response.data);
      } catch (error) {
        console.error('Error fetching datasets:', error);
        if (error.response && error.response.status === 401) {
          onLogout(); // Log out if unauthorized
        }
      }
    };

    fetchDatasets();
  }, [onLogout]);

  const handleDatasetClick = (dataset) => {
    setSelectedDataset(dataset);
  };

  const handleLogout = () => {
    onLogout(); // Trigger logout callback
    navigate('/login', { replace: true }); // Ensure immediate redirection
  };

  return (
    <div>
      <div className="header">
        <h1>Available Datasets</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="datasets-list">
        {datasets.map((dataset) => (
          <button
            key={dataset.id}
            className="dataset-button"
            onClick={() => handleDatasetClick(dataset)}
          >
            {dataset.name}
          </button>
        ))}
      </div>

      {selectedDataset && (
        <div className="dataset-table-container">
          <DatasetTable datasetId={selectedDataset.id} datasetName={selectedDataset.name} />
        </div>
      )}
    </div>
  );
};

export default DatasetsPage;
