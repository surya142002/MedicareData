# Medicare Data Viewer

A web application designed to make browsing and searching Medicare public datasets (like ICD-10-CM, HCPCS, etc.) intuitive and efficient. This platform provides user registration, secure login, dataset browsing with pagination, basic and advanced search, and admin functionalities for dataset uploads and analytics.

---

## Features

### User Features

- **Registration/Login**: Secure user authentication using JWT and bcrypt.
- **Dataset Browsing**: View datasets in a paginated UI.
- **Search Functionality**:
  - Basic Search: Search by code or description.
  - Advanced Search: LLM-powered for typo handling, synonyms, and word reordering (planned).

### Admin Features

- **Dataset Upload**: Upload new datasets via a user-friendly interface.
- **Analytics Dashboard**: View user activity and dataset usage statistics.

### Scalability & Security

- Secure authentication and role-based access control.
- Efficient handling of large datasets with optimized queries and indexing.

---

## Technology Stack

### Frontend

- **Framework**: React.js
- **Styling**: Custom CSS
- **State Management**: React Hooks
- **API Communication**: Axios

### Backend

- **Framework**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT and bcrypt
- **File Uploads**: Multer

### Additional Tools

- **Search**: Elasticsearch (for advanced search, planned)
- **Hosting**: TBD (e.g., Netlify/Vercel for frontend, Heroku/AWS for backend, planned)

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
