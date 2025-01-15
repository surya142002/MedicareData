import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AnalyticsPage = () => {
    const [userActivity, setUserActivity] = useState([]);
    const [datasetUsage, setDatasetUsage] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const userActivityResponse = await api.get('/analytics/user-activity');
                console.log('User Activity Data:', userActivityResponse.data);

                const datasetUsageResponse = await api.get('/analytics/dataset-usage');
                console.log('Dataset Usage Data:', datasetUsageResponse.data);

                setUserActivity(userActivityResponse.data);
                setDatasetUsage(datasetUsageResponse.data);

            } catch (error) {
                console.error('Failed to fetch analytics data:', error.response?.data || error.message);
            }
        };

        fetchAnalytics();
    }, []);

    return (
        <div className="analytics-page">
        <button className="back-button" onClick={() => navigate('/datasets')}>Back</button>
        <h1>Analytics Dashboard</h1>
        <div className="analytics-section">
            <h2>User Activity</h2>
            {userActivity.length > 0 ? (
                userActivity.map(activity => (
                    <p key={activity.id}>
                        {activity.user_id} performed {activity.action_type} - {activity.action_details}
                    </p>
                ))
            ) : (
                <p>No user activity found.</p>
            )}
        </div>

        <div className="analytics-section">
            <h2>Dataset Usage</h2>
            {datasetUsage.length > 0 ? (
                datasetUsage.map(usage => (
                    <p key={usage.id}>
                        {usage.dataset_id}: {usage.action_type} - {usage.search_term} ({usage.usage_count} times)
                    </p>
                ))
            ) : (
                <p>No dataset usage found.</p>
            )}
        </div>
    </div>
    );
};

export default AnalyticsPage;
