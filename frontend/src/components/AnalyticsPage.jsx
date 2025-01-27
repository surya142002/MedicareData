import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const AnalyticsPage = () => {
    // Define state variables for user activity and dataset usage
    const [userActivity, setUserActivity] = useState([]);
    const [datasetUsage, setDatasetUsage] = useState([]);
    const [userActivityPage, setUserActivityPage] = useState(1);
    const [datasetUsagePage, setDatasetUsagePage] = useState(1);
    const [userActivityTotalPages, setUserActivityTotalPages] = useState(0);
    const [datasetUsageTotalPages, setDatasetUsageTotalPages] = useState(0);
    const [userActivityError, setUserActivityError] = useState(null);
    const [datasetUsageError, setDatasetUsageError] = useState(null);
    const navigate = useNavigate();

    // Fetch user activity logs from the backend with pagination
    const fetchUserActivity = async (page) => {
        try {
            const response = await api.get(`/analytics/user-activity?page=${page}&limit=10`);
            setUserActivity(response.data.data);
            setUserActivityTotalPages(response.data.totalPages);
            setUserActivityError(null); // Clear any previous errors
        } catch (error) {
            console.error("Failed to fetch user activity:", error.response?.data || error.message);
            setUserActivityError("Failed to fetch user activity. Please try again.");
        }
    };

    // Fetch dataset usage logs from the backend with pagination
    const fetchDatasetUsage = async (page) => {
        try {
            const response = await api.get(`/analytics/dataset-usage?page=${page}&limit=10`);
            setDatasetUsage(response.data.data);
            setDatasetUsageTotalPages(response.data.totalPages);
            setDatasetUsageError(null); // Clear any previous errors
        } catch (error) {
            console.error("Failed to fetch dataset usage:", error.response?.data || error.message);
            setDatasetUsageError("Failed to fetch dataset usage. Please try again.");
        }
    };

    // Fetch data when the page changes
    useEffect(() => {
        fetchUserActivity(userActivityPage);
        fetchDatasetUsage(datasetUsagePage);
    }, [userActivityPage, datasetUsagePage]);

    // Handle page change for user activity and dataset usage
    const handlePageChange = (type, newPage) => {
        if (type === "userActivity" && newPage > 0 && newPage <= userActivityTotalPages) {
            setUserActivityPage(newPage);
        }
        if (type === "datasetUsage" && newPage > 0 && newPage <= datasetUsageTotalPages) {
            setDatasetUsagePage(newPage);
        }
    };

    // Render the analytics page
    return (
        <div className="analytics-page">
            <button className="back-button" onClick={() => navigate("/datasets")}>Back</button>
            <h1 className="page-title">Analytics Dashboard</h1>

            <div className="analytics-section">
                <h2 className="header-title">User Activity</h2>
                {userActivityError ? (
                    <p className="error-message">{userActivityError}</p>
                ) : userActivity.length > 0 ? (
                    <>
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Action</th>
                                    <th>Details</th>
                                    <th>Timestamp</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userActivity.map((activity, index) => (
                                    <tr key={activity.id || index}>
                                        <td>{activity.userEmail}</td>
                                        <td>{activity.actionType}</td>
                                        <td>{activity.actionDetails}</td>
                                        <td>{new Date(activity.timestamp).toLocaleString()}</td>
                                        <td>{activity.ipAddress}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange("userActivity", userActivityPage - 1)}
                                disabled={userActivityPage === 1}
                            >
                                Previous
                            </button>
                            <span>Page {userActivityPage} of {userActivityTotalPages}</span>
                            <button
                                onClick={() => handlePageChange("userActivity", userActivityPage + 1)}
                                disabled={userActivityPage === userActivityTotalPages}
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="status-message">No user activity found.</p>
                )}
            </div>

            <div className="analytics-section">
                <h2 className="header-title">Dataset Usage</h2>
                {datasetUsageError ? (
                    <p className="error-message">{datasetUsageError}</p>
                ) : datasetUsage.length > 0 ? (
                    <>
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Dataset Name</th>
                                    <th>Action</th>
                                    <th>Search Term</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datasetUsage.map((usage, index) => (
                                    <tr key={usage.id || index}>
                                        <td>{usage.datasetName}</td>
                                        <td>{usage.actionType}</td>
                                        <td>{usage.searchTerm || "N/A"}</td>
                                        <td>{new Date(usage.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange("datasetUsage", datasetUsagePage - 1)}
                                disabled={datasetUsagePage === 1}
                            >
                                Previous
                            </button>
                            <span>Page {datasetUsagePage} of {datasetUsageTotalPages}</span>
                            <button
                                onClick={() => handlePageChange("datasetUsage", datasetUsagePage + 1)}
                                disabled={datasetUsagePage === datasetUsageTotalPages}
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="status-message">No dataset usage found.</p>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;
