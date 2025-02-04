# Medicare Data Viewer

**Medicare Data Viewer** is a web application designed to make browsing and searching **Medicare public datasets** (such as **ICD-10-CM, HCPCS**) more accessible and efficient. The platform provides **secure user authentication**, **dataset browsing with pagination**, **basic search functionality**, and **admin tools** for managing datasets and tracking analytics.

🚀 **[View Live Website](https://medicaredata.vercel.app/login)** 

## Features

### User Features

- **Secure Authentication**: Users can register and log in using **JWT-based authentication** with **bcrypt-hashed passwords**.
- **Dataset Browsing**: View and navigate datasets with **paginated results**.
- **Search Functionality**:
  - **Basic Search**: Search by **code** or **description**.
  - **Advanced Search** _(Planned)_: Uses **LLM-powered search** to handle **typos, synonyms, and word order variations**.

### Admin Features

- **Dataset Management**:
  - Upload new datasets through a **user-friendly UI**.
  - Delete outdated datasets securely.
- **Usage Analytics**:
  - Track user activity and dataset interactions.
  - View **dataset search trends** and **user login statistics**.

### Scalability & Security

- **Role-Based Access Control (RBAC)**: Restrict admin-only functionalities.
- **Optimized Database Queries**: Efficient indexing ensures **fast dataset retrieval**.
- **Secure Communication**: Data is encrypted and transferred over **HTTPS**.

---

## Technology Stack

### **Frontend**

- **Framework**: [React.js](https://reactjs.org/)
- **Styling**: Custom **CSS**
- **State Management**: React Hooks
- **API Communication**: [Axios](https://axios-http.com/)

### **Backend**

- **Framework**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: JWT and bcrypt
- **File Uploads**: Multer for handling dataset uploads

### **Search Engine**

- **Basic Search**: SQL-based querying
- **Advanced Search (Planned)**: [Elasticsearch](https://www.elastic.co/) for more powerful indexing

### **Hosting**

- **Frontend**: [Vercel](https://vercel.com/)
- **Backend**: [Heroku](https://www.heroku.com/)
- **Database**: Heroku PostgreSQL

---

## Testing

### **Backend Tests**

Run unit tests with:

```sh
cd backend
npm test
```

### **Frontend Tests**

Run unit tests with:

```sh
cd frontend
npm test
```

---

## Roadmap

### **✅ MVP Features**

✔️ User Registration & Login  
✔️ Dataset Browsing & Pagination  
✔️ Basic Search (ICD-10-CM & HCPCS)  
✔️ Admin Dataset Upload & Deletion  
✔️ Analytics Dashboard

### **⏳ In Progress**

🔄 UI/UX Improvements  
🔄 Performance Optimization

### **🚀 Future Enhancements**

🔹 **Advanced Search** (LLM-powered typo correction, synonyms, etc.)  
🔹 **Mobile App** (React Native)  
🔹 **Predictive Analytics** for search trends  
🔹 **User Feedback Mechanisms**
