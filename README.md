# Document Management System

A full-stack document management application with Django and React. This application allows users to view, annotate, search, and version-control documents.

## Features

- **Document Viewer SDK**: Render PDF and other document types for in-platform viewing
- **Keyword Search**: Search for text within documents with highlighted results
- **Multi-Page Navigation**: Navigate through multi-page documents with toolbar controls
- **Document Annotation**: Add comments and highlights to documents
- **Document Versioning**: Track multiple versions of the same document
- **Text Extraction**: Automatically extract text from PDF documents for searching
- **User Authentication**: Secure login/registration system with token authentication

## Technology Stack

### Backend

- **Django 5.1**: Modern Python web framework
- **Django REST Framework**: API development toolkit for building RESTful APIs
- **PyPDF2**: PDF text extraction and processing
- **SQLite**: Default database (can be switched to PostgreSQL for production)
- **Token Authentication**: Secure API endpoints with token-based authentication

### Frontend

- **React 19**: Latest React version with hooks for state management
- **React Router 7**: Client-side routing
- **React-PDF**: PDF rendering and text layer processing
- **Tailwind CSS 4**: Utility-first CSS framework
- **Vite**: Next-generation frontend build tool
- **Axios**: Promise-based HTTP client
- **Headless UI**: Unstyled, accessible UI components

## Project Structure

```
docmanagement/
├── backend/              # Django backend
│   ├── docmanager/       # Main Django project
│   ├── documents/        # Documents app
│   ├── media/            # Uploaded files
│   └── requirements.txt  # Python dependencies
│
└── frontend/             # React frontend
    ├── public/           # Static files
    ├── src/              # React source code
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── utils/        # Utility functions
    │   └── context/      # Context providers
    └── package.json      # JavaScript dependencies
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):

   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies using the requirements file:

   ```bash
   pip install -r requirements.txt
   ```

4. Apply migrations to create the database schema:

   ```bash
   python manage.py migrate
   ```

5. Create a superuser for accessing the admin panel:

   ```bash
   python manage.py createsuperuser
   # Follow the prompts to create an admin user
   ```

6. Run the development server:

   ```bash
   python manage.py runserver
   ```

   The backend will be available at http://localhost:8000/

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The frontend will be available at http://localhost:5173/

## Key Features and Usage Guide

### Authentication

1. Register a new account or login with an existing account
2. Backend uses token authentication - the token is stored in localStorage
3. All API requests require authentication headers

### Document Management

1. **Uploading Documents**:

   - Click "Upload Document" on the dashboard
   - Select a file (PDF support is most comprehensive)
   - The system automatically extracts text from PDFs for searching

2. **Viewing Documents**:

   - Documents can be viewed directly in the browser
   - PDF files have full text selection and search capabilities
   - Use the document toolbar to navigate pages, zoom, and download

3. **Searching Within Documents**:

   - Use the search panel to search text within a document
   - Results show context around matches with page numbers
   - Click on a result to navigate to that page
   - Search terms are highlighted both in search results and in the document view

4. **Document Versioning**:

   - Upload new versions of existing documents
   - Switch between versions to see different iterations
   - Version history shows metadata and creation date

5. **Annotations**:
   - Add comments to documents at specific positions
   - View all annotations for a document in the sidebar

## API Endpoints

### Authentication

- `POST /api/register/` - Register a new user
- `POST /api/login/` - Login to get authentication token

### Documents

- `GET /api/documents/` - List all documents for authenticated user
- `POST /api/documents/` - Upload a new document
- `GET /api/documents/:id/` - Get document details
- `PUT /api/documents/:id/` - Update document details
- `DELETE /api/documents/:id/` - Delete a document
- `GET /api/documents/:id/search/` - Search within document content

### Versions

- `GET /api/documents/:id/version-list/` - List all versions for a document
- `POST /api/documents/:id/version-create/` - Add a new version

### Annotations

- `GET /api/documents/:id/annotations/` - List annotations for a document
- `POST /api/documents/:id/create-annotation/` - Add annotation to a document

## Development

### Backend Development

- Django admin interface is available at http://localhost:8000/admin/
- API browsable interface at http://localhost:8000/api/
- Debug mode is enabled in development settings
- Check docmanager/settings.py for configuration options

### Frontend Development

- Tailwind CSS is configured with a custom theme (see index.css)
- Component structure follows a modular approach
- State management uses React context for global state

## Deployment

### Backend Deployment

1. Set `DEBUG = False` in settings.py
2. Configure a production database (PostgreSQL recommended)
3. Set a secure `SECRET_KEY`
4. Set up static and media file serving (e.g., AWS S3, Cloudinary)
5. Use Gunicorn as a WSGI server with a reverse proxy (Nginx)

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   # or
   yarn build
   ```
2. Deploy the contents of the `dist` directory to a static file host or CDN

## Troubleshooting

- **PDF rendering issues**: Make sure PDF.js worker files are correctly set up (a setup script runs automatically on `npm install`)
- **CORS errors**: Check that the backend CORS settings include your frontend URL
- **Authentication errors**: Verify that the token format is correct (`Token <your-token>`)

## License

[MIT License](LICENSE)
