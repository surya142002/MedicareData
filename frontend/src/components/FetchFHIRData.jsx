import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const FetchFHIRData = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Function to fetch selected FHIR dataset
  const fetchFHIRData = async (datasetType) => {
    setLoading(true);
    setMessage("");
    try {
      const endpoints = {
        Patients: "/fhir/fetch-patients",
        Claims: "/fhir/fetch-claims",
        Encounters: "/fhir/fetch-encounters",
      };

      const response = await api.get(endpoints[datasetType]);
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error fetching FHIR data:", error);
      setMessage("Failed to fetch FHIR data.");
    }
    setLoading(false);
  };

  return (
    <div className="fetch-fhir-page">
      {/* Back button */}
      <button className="back-button" onClick={() => navigate("/datasets")}>
        Back
      </button>

      {/* Page Title */}
      <h1 className="fetch-title">Import FHIR Dataset</h1>

      {/* Button Group */}
      <div className="fetch-button-group">
        <button className="dataset-button" onClick={() => fetchFHIRData("Patients")} disabled={loading}>
          {loading ? "Fetching..." : "Fetch Patients"}
        </button>
        <button className="dataset-button" onClick={() => fetchFHIRData("Claims")} disabled={loading}>
          {loading ? "Fetching..." : "Fetch Claims"}
        </button>
        <button className="dataset-button" onClick={() => fetchFHIRData("Encounters")} disabled={loading}>
          {loading ? "Fetching..." : "Fetch Encounters"}
        </button>
      </div>

      {/* Status Message */}
      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default FetchFHIRData;
