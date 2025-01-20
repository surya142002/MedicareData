import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AnalyticsPage = () => {
    const [userActivity, setUserActivity] = useState([]);
    const [datasetUsage, setDatasetUsage] = useState([]);
    const [userActivityPage, setUserActivityPage] = useState(1);
    const [datasetUsagePage, setDatasetUsagePage] = useState(1);
    const [userActivityTotalPages, setUserActivityTotalPages] = useState(0);
    const [datasetUsageTotalPages, setDatasetUsageTotalPages] = useState(0);
    const navigate = useNavigate();

    const fetchUserActivity = async (page) => {
        try {
            const response = await api.get(`/analytics/user-activity?page=${page}&limit=10`);
            setUserActivity(response.data.data);
            setUserActivityTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Failed to fetch user activity:', error.response?.data || error.message);
        }
    };

    const fetchDatasetUsage = async (page) => {
        try {
            const response = await api.get(`/analytics/dataset-usage?page=${page}&limit=10`);
            setDatasetUsage(response.data.data);
            setDatasetUsageTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Failed to fetch dataset usage:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchUserActivity(userActivityPage);
        fetchDatasetUsage(datasetUsagePage);
    }, [userActivityPage, datasetUsagePage]);

    const handlePageChange = (type, newPage) => {
        if (type === 'userActivity' && newPage > 0 && newPage <= userActivityTotalPages) {
            setUserActivityPage(newPage);
        }
        if (type === 'datasetUsage' && newPage > 0 && newPage <= datasetUsageTotalPages) {
            setDatasetUsagePage(newPage);
        }
    };

    return (
        <div className="analytics-page">
            <button className="back-button" onClick={() => navigate('/datasets')}>Back</button>
            <h1 className="page-title">Analytics Dashboard</h1>

            <div className="analytics-section">
                <h2 className="header-title">User Activity</h2>
                {userActivity.length > 0 ? (
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
                                onClick={() => handlePageChange('userActivity', userActivityPage - 1)}
                                disabled={userActivityPage === 1}
                            >
                                Previous
                            </button>
                            <span>Page {userActivityPage} of {userActivityTotalPages}</span>
                            <button
                                onClick={() => handlePageChange('userActivity', userActivityPage + 1)}
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
                {datasetUsage.length > 0 ? (
                    <>
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Dataset Name</th>
                                    <th>Action</th>
                                    <th>Search Term</th>
                                    <th>Usage Count</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datasetUsage.map((usage, index) => (
                                    <tr key={usage.id || index}>
                                        <td>{usage.datasetName}</td>
                                        <td>{usage.actionType}</td>
                                        <td>{usage.searchTerm || 'N/A'}</td>
                                        <td>{usage.usageCount}</td>
                                        <td>{new Date(usage.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange('datasetUsage', datasetUsagePage - 1)}
                                disabled={datasetUsagePage === 1}
                            >
                                Previous
                            </button>
                            <span>Page {datasetUsagePage} of {datasetUsageTotalPages}</span>
                            <button
                                onClick={() => handlePageChange('datasetUsage', datasetUsagePage + 1)}
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
