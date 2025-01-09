import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const DatasetsPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [icd10cmData, setIcd10cmData] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch datasets
    api
      .get('/datasets')
      .then((response) => {
        setDatasets(response.data);
      })
      .catch((err) => {
        console.error('Error fetching datasets:', err);
        setError('Failed to fetch datasets');
      });
  }, [navigate]);

  const fetchICD10CMData = (datasetId, page = 1) => {
    api
      .get(`/datasets/${datasetId}/data`, { params: { page, limit: 10 } })
      .then((response) => {
        setIcd10cmData(response.data.data);
        setPagination({ currentPage: response.data.currentPage, totalPages: response.data.totalPages });
        setSelectedDataset(datasetId);
      })
      .catch((err) => {
        console.error('Error fetching ICD-10-CM data:', err);
        setError('Failed to fetch ICD-10-CM data');
      });
  };

  const handlePageChange = (newPage) => {
    if (selectedDataset) {
      fetchICD10CMData(selectedDataset, newPage);
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Available Datasets</h2>
      <ul>
        {datasets.map((dataset) => (
          <li key={dataset.id}>
            {dataset.name} (Records: {dataset.recordCount})
            <button onClick={() => fetchICD10CMData(dataset.id)}>View Data</button>
          </li>
        ))}
      </ul>

      {selectedDataset && (
        <div>
          <h3>ICD-10-CM Data</h3>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Short Description</th>
                <th>Long Description</th>
                <th>Valid?</th>
              </tr>
            </thead>
            <tbody>
              {icd10cmData.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.code}</td>
                  <td>{entry.short_description}</td>
                  <td>{entry.long_description}</td>
                  <td>{entry.is_valid ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
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
