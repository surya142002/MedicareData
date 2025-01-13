import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const DatasetTable = ({ datasetId, datasetName }) => {
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  // Fetch dataset entries from the backend
  const fetchEntries = async (page = 1, search = '') => {
    try {
      const response = await api.get(`/datasets/${datasetId}/entries`, {
        params: { page, limit: 10, searchTerm: search },
      });
      setEntries(response.data.entries);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
      });
    } catch (error) {
      console.error('Error fetching dataset entries:', error);
    }
  };

  // Reset search bar and fetch entries when datasetId changes
  useEffect(() => {
    setSearchTerm(''); // Reset the search term
    fetchEntries(); // Fetch entries for the new dataset
  }, [datasetId]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    fetchEntries(1, value); // Reset to the first page with the search term
  };

  const handlePageChange = (newPage) => {
    fetchEntries(newPage, searchTerm); // Fetch new page data
  };

  return (
    <div className="dataset-container">
      <h2>{datasetName}</h2>
      <input
        type="text"
        placeholder={`Search in ${datasetName}`}
        value={searchTerm}
        onChange={handleSearch}
        className="search-bar"
      />
      <table className="dataset-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
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
  );
};

export default DatasetTable;
