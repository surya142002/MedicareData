import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap for styling
import { StrictMode } from 'react'; // React's StrictMode for development checks
import { createRoot } from 'react-dom/client'; // React DOM rendering
import './index.css'; // Custom global CSS styles
import App from './App.jsx'; // Main App component

/**
 * Entry point of the React application.
 * - Wraps the App component with StrictMode. (REMOVE TO GET RID OF THE DOUBLE RENDERING BS)
 * - Mounts the React app into the HTML element with id 'root'.
 */
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);
