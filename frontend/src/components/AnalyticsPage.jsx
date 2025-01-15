import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const AnalyticsPage = () => {
    const [userActivity, setUserActivity] = useState([]);
    const [datasetUsage, setDatasetUsage] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [userActivityRes, datasetUsageRes] = await Promise.all([
                    api.get('/analytics/user-activity'),
                    api.get('/analytics/dataset-usage'),
                ]);
                setUserActivity(userActivityRes.data);
                setDatasetUsage(datasetUsageRes.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <div className="analytics-page">
            <h1>Analytics Dashboard</h1>

            <div className="analytics-section">
                <h2>User Activity</h2>
                <ul>
                    {userActivity.map((log) => (
                        <li key={log.id}>
                            {log.action_type} by User {log.user_id} on {new Date(log.timestamp).toLocaleString()}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="analytics-section">
                <h2>Dataset Usage</h2>
                <ul>
                    {datasetUsage.map((usage) => (
                        <li key={usage.id}>
                            Dataset {usage.dataset_id}: {usage.action_type} - {usage.search_term || 'N/A'} ({usage.usage_count} times)
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AnalyticsPage;
