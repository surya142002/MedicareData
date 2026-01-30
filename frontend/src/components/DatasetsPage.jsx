import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import DatasetTable from "./DatasetsTable";

const DatasetsPage = ({ onLogout }) => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);

  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("role") === "admin";

  // Fetch datasets on mount
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await api.get("/datasets");
        console.log("Fetched datasets:", response.data);
        setDatasets(response.data);
      } catch (error) {
        console.error("Error fetching datasets:", error);
        if (error.response?.status === 401) {
          onLogout();
        }
      }
    };

    fetchDatasets();
  }, [onLogout]);

  // Dataset selection
  const handleDatasetClick = (dataset) => {
    setSelectedDataset(dataset);
  };

  // Logout
  const handleLogout = () => {
    onLogout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="datasets-page">
      {/* Header buttons */}
      <div className="header-buttons">
        {isAdmin && (
          <>
            <button className="admin-button" onClick={() => navigate("/upload")}>
              Upload Dataset
            </button>
            <button className="admin-button" onClick={() => navigate("/delete")}>
              Delete Dataset
            </button>
            <button className="admin-button" onClick={() => navigate("/analytics")}>
              Analytics
            </button>
          </>
        )}

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Dataset list */}
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
          <DatasetTable
            datasetId={selectedDataset.id}
            datasetName={selectedDataset.name}
          />
        </div>
      )}
    </div>
  );
};

DatasetsPage.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default DatasetsPage;
