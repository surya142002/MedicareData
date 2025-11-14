import React, { useState, useEffect } from "react";
import api from "../utils/api";

const DatasetTable = ({ datasetId, datasetName }) => {
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const [mode, setMode] = useState("exact");

  // -------------------------
  // Load EXACT search
  // -------------------------
  const loadExact = async (page, search) => {
    try {
      const response = await api.get(`/datasets/${datasetId}/entries`, {
        params: {
          page,
          limit: 10,
          searchTerm: search,
          mode: "exact",
        },
      });

      setEntries(response.data.entries);
      setPagination({
        currentPage: page,
        totalPages: response.data.totalPages,
      });
    } catch (err) {
      console.error("Exact search error:", err);
    }
  };

  // -------------------------
  // Load SEMANTIC search
  // -------------------------
  const loadSemantic = async (search) => {
    try {
      const response = await api.post(`/llm-search`, {
        datasetId,
        query: search,
      });

      setEntries(response.data.results || []);
    } catch (err) {
      console.error("Semantic search error:", err);
    }
  };

  // -------------------------
  // EFFECT: EXACT MODE
  // TRIGGER ON searchTerm changes
  // -------------------------
  useEffect(() => {
    if (mode === "exact") {
      loadExact(pagination.currentPage, searchTerm);
    }
  }, [datasetId, mode, pagination.currentPage, searchTerm]);

  // -------------------------
  // EFFECT: SEMANTIC MODE
  // -------------------------
  useEffect(() => {
    if (mode === "semantic") {
      loadSemantic(searchTerm);
    }
  }, [datasetId, mode, searchTerm]);

  // -------------------------
  // Reset when switching dataset
  // -------------------------
  useEffect(() => {
    setMode("exact");
    setSearchTerm("");
    setEntries([]);
    setPagination({ currentPage: 1, totalPages: 1 });
  }, [datasetId]);

  // -------------------------
  // Search handler
  // -------------------------
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (mode === "exact") {
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }));
    }
  };

  // -------------------------
  // Pagination (EXACT only)
  // -------------------------
  const handlePageChange = (newPage) => {
    if (mode !== "exact") return;
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  // -------------------------
  // Table headers
  // -------------------------
  const getHeaders = () => {
    if (entries.length === 0) return [];
    return Object.keys(entries[0].data || {});
  };

  return (
    <div className="dataset-container">
      <h2>{datasetName}</h2>

      {/* Mode Toggle */}
      <div style={{ marginBottom: "10px", textAlign: "center" }}>
        <label>
          <input
            type="radio"
            value="exact"
            checked={mode === "exact"}
            onChange={() => {
              setMode("exact");
              setPagination({ currentPage: 1, totalPages: 1 });
            }}
          />
          {" "}Exact Search
        </label>

        <label style={{ marginLeft: "15px" }}>
          <input
            type="radio"
            value="semantic"
            checked={mode === "semantic"}
            onChange={() => {
              setMode("semantic");
            }}
          />
          {" "}AI Search
        </label>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder={`Search in ${datasetName}`}
        value={searchTerm}
        onChange={handleSearch}
        className="search-bar"
      />

      {/* Table */}
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
            {entries.length === 0 ? (
              <tr>
                <td colSpan={getHeaders().length} style={{ textAlign: "center" }}>
                  No results found.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id}>
                  {getHeaders().map((header) => (
                    <td key={header}>{entry.data[header] || "N/A"}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {mode === "exact" && (
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
      )}
    </div>
  );
};

export default DatasetTable;
