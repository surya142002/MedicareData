import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const DatasetsPage = ({ onLogout }) => {
  const [datasets, setDatasets] = useState([]); // Store datasets
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [datasetEntries, setDatasetEntries] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await api.get('/datasets'); // Correct API endpoint
        setDatasets(response.data); // Store resolved data in state
      } catch (err) {
        console.error('Error fetching datasets:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          onLogout(); // Redirect to login if unauthorized
        } else {
          setError('Failed to fetch datasets. Please try again.');
        }
      }
    };

    const token = localStorage.getItem('token');
    if (!token) {
      onLogout(); // Redirect to login if no token
    } else {
      fetchDatasets();
    }
  }, [navigate, onLogout]);

  const fetchDatasetEntries = async (datasetId, page = 1) => {
    try {
      const response = await api.get(`/datasets/${datasetId}/entries`, { params: { page, limit: 10 } });
      setDatasetEntries(response.data.entries);
      setPagination({
        currentPage: parseInt(response.data.currentPage, 10), // Ensure it is an integer
        totalPages: parseInt(response.data.totalPages, 10), // Ensure it is an integer
      });
      setSelectedDataset(datasetId);
    } catch (err) {
      console.error('Error fetching dataset entries:', err.response?.data || err.message);
      setError('Failed to fetch dataset entries. Please try again.');
    }
  };

  const handlePageChange = (newPage) => {
    if (selectedDataset) {
      fetchDatasetEntries(selectedDataset, newPage);
    }
  };

  if (error) {
    return <div className="container">{error}</div>;
  }

  return (
    <div className="container">
      <div className="logout-container">
        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem('token'); // Clear token
            navigate('/login'); // Redirect to login
            if (onLogout) {
              onLogout(); // Notify parent component
            }
          }}
        >
          Logout
        </button>
      </div>

      <h2 className="page-title">Available Datasets</h2>

      <div className="datasets-container">
        {datasets.map((dataset) => (
          <button
            key={dataset.id}
            className="dataset-button"
            onClick={() => fetchDatasetEntries(dataset.id)}
          >
            {dataset.name}
          </button>
        ))}
      </div>

      {selectedDataset && (
        <div>
          <h3 className="table-title">Dataset Entries</h3>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {datasetEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.data.code}</td>
                  <td>{entry.data.description}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetsPage;
