import React, { useState, useEffect } from "react";
import api from "../utils/api";

const DatasetTable = ({ datasetId, datasetName }) => {
  // State variables
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  // Fetch dataset entries from the backend
  const fetchEntries = async (page = pagination.currentPage, search = searchTerm) => {
    try {
      const response = await api.get(`/datasets/${datasetId}/entries`, {
        params: { page, limit: 10, searchTerm: search },
      });
  
      setEntries(response.data.entries);
      setPagination({
        currentPage: page,
        totalPages: response.data.totalPages,
      });
    } catch (error) {
      console.error("Error fetching dataset entries:", error);
    }
  };  
  

  // Reset search bar and fetch entries when datasetId changes
  useEffect(() => {
    setSearchTerm("");
    fetchEntries(1, ""); // Always start at page 1 when switching datasets
  }, [datasetId]);

  // Search bar handler
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    fetchEntries(1, value); // 🔹 Ensure searchTerm is sent to backend
  };  
  

  // Pagination handler
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      fetchEntries(newPage, searchTerm);
    }
  };

  // Extract headers dynamically from the dataset entries
  const getHeaders = () => {
    if (entries.length === 0) return [];
    return Object.keys(entries[0]?.data || {});
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
