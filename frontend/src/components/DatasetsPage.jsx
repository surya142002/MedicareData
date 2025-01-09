import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const DatasetsPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login'); // Redirect to login if not authenticated
      return;
    }

    api
      .get('/datasets', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        console.log('Fetched datasets:', response.data);
        setDatasets(response.data);
      })
      .catch((err) => {
        console.error('Error fetching datasets:', err);
        setError('Failed to fetch datasets');
      });
  }, [navigate]);

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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DatasetsPage;
