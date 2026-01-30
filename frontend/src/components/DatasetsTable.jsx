import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from "../utils/api";

const DatasetTable = ({ datasetId, datasetName }) => {
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [semanticResults, setSemanticResults] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const [mode, setMode] = useState("exact");
  const pageSize = 10;

  const loadExact = async (page, search) => {
    try {
      const response = await api.get(`/datasets/${datasetId}/entries`, {
        params: {
          page,
          limit: pageSize,
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

  const loadSemantic = async (search) => {
    try {
      const response = await api.post(`/llm-search`, {
        datasetId,
        query: search,
      });

      const results = response.data.results || [];
      const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
      setSemanticResults(results);
      setPagination({ currentPage: 1, totalPages });
      setEntries(results.slice(0, pageSize));
    } catch (err) {
      console.error("Semantic search error:", err);
    }
  };

  useEffect(() => {
    if (mode === "exact") {
      loadExact(pagination.currentPage, searchTerm);
    }
  }, [datasetId, mode, pagination.currentPage, searchTerm]);

  useEffect(() => {
    if (mode === "semantic") {
      loadSemantic(searchTerm);
    }
  }, [datasetId, mode, searchTerm]);

  useEffect(() => {
    setMode("exact");
    setSearchTerm("");
    setEntries([]);
    setSemanticResults([]);
    setPagination({ currentPage: 1, totalPages: 1 });
  }, [datasetId]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      if (mode === "semantic") {
        const start = (newPage - 1) * pageSize;
        setEntries(semanticResults.slice(start, start + pageSize));
      }
    }
  };

  const getHeaders = () => {
    if (entries.length === 0) return [];
    return Object.keys(entries[0].data || {});
  };

  return (
    <div className="dataset-container">
      <h2>{datasetName}</h2>

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
          {" "}Semantic Search
        </label>
      </div>

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
            {entries.length === 0 ? (
              <tr>
                <td colSpan={Math.max(getHeaders().length, 1)} style={{ textAlign: "center" }}>
                  No results found.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id}>
                  {getHeaders().map((header) => (
                    <td key={header}>{entry.data?.[header] ?? "N/A"}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(mode === "exact" || mode === "semantic") && (
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

DatasetTable.propTypes = {
  datasetId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  datasetName: PropTypes.string.isRequired,
};

export default DatasetTable;
