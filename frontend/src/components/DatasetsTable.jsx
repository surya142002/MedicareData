import React, { useState, useEffect } from "react";
import api from "../utils/api";

const DatasetTable = ({ datasetId, datasetName }) => {
  // State variables
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  // Fetch dataset entries from the backend
  const fetchEntries = async (page = 1, search = "") => {
    try {
      // Fetch entries from the API
      const response = await api.get(`/datasets/${datasetId}/entries`, {
        params: { page, limit: 10, searchTerm: search },
      });
      setEntries(response.data.entries);
      // Update pagination state
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
      });
    } catch (error) {
      console.error("Error fetching dataset entries:", error);
    }
  };

  // Reset search bar and fetch entries when datasetId changes
  useEffect(() => {
    setSearchTerm(""); // Reset the search term
    fetchEntries(); // Fetch entries for the new dataset
  }, [datasetId]);

  // Search bar handler
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    fetchEntries(1, value); // Reset to the first page with the search term
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    fetchEntries(newPage, searchTerm); // Fetch new page data
  };

  // Extract headers dynamically from the dataset entries
  const getHeaders = () => {
    if (entries.length === 0) return [];
    return Object.keys(entries[0].data);
  };

  return (
    <div className="dataset-container">
      {/* Dataset name */}
      <h2>{datasetName}</h2>
      <input
        type="text"
        placeholder={`Search in ${datasetName}`}
        value={searchTerm}
        onChange={handleSearch}
        className="search-bar"
      />
      
      {/* Scrollable table container */}
      <div className="table-container">
        <table className="dataset-table">
          <thead>
            <tr>
              {getHeaders().map((header) => (
                <th key={header}>{header.replace("_", " ").toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                {getHeaders().map((header) => (
                  <td key={header}>{entry.data[header] || "N/A"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination buttons */}
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
