import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Helper to setup axios with auth header
const createAuthenticatedAxios = (token) => {
  const headers = {};

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  return axios.create({
    baseURL: API_URL,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });
};

// Document main operations
export const getDocuments = async (token) => {
  try {
    const authAxios = createAuthenticatedAxios(token);
    const response = await authAxios.get("/documents/");
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

export const getDocument = async (documentId, token) => {
  try {
    const authAxios = createAuthenticatedAxios(token);
    const response = await authAxios.get(`/documents/${documentId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching document ${documentId}:`, error);
    throw error;
  }
};

export const createDocument = async (documentData, token) => {
  try {
    const authAxios = createAuthenticatedAxios(token);
    const response = await authAxios.post("/documents/", documentData);
    return response.data;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

export const updateDocument = async (documentId, documentData, token) => {
  try {
    const authAxios = createAuthenticatedAxios(token);
    const response = await authAxios.put(
      `/documents/${documentId}/`,
      documentData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating document ${documentId}:`, error);
    throw error;
  }
};

export const deleteDocument = async (documentId, token) => {
  try {
    const authAxios = createAuthenticatedAxios(token);
    await authAxios.delete(`/documents/${documentId}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting document ${documentId}:`, error);
    throw error;
  }
};

// Document version operations
export const getDocumentVersions = async (documentId, token) => {
  try {
    const authAxios = createAuthenticatedAxios(token);
    const response = await authAxios.get(`/documents/${documentId}/versions/`);
    // Handle case where API returns paginated results
    return response.data.results || response.data;
  } catch (error) {
    console.error(`Error fetching versions for document ${documentId}:`, error);
    throw error;
  }
};

export const createDocumentVersion = async (documentId, formData, token) => {
  try {
    // Need to override headers for file upload
    const authAxios = axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const response = await authAxios.post(
      `/documents/${documentId}/versions/`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error(`Error creating version for document ${documentId}:`, error);
    throw error;
  }
};

export const deleteDocumentVersion = async (documentId, versionId, token) => {
  try {
    const authAxios = createAuthenticatedAxios(token);
    await authAxios.delete(`/documents/${documentId}/versions/${versionId}/`);
    return true;
  } catch (error) {
    console.error(
      `Error deleting version ${versionId} for document ${documentId}:`,
      error
    );
    throw error;
  }
};

// Document annotation operations
export const getAnnotations = async (documentId, token) => {
  try {
    const authAxios = createAuthenticatedAxios(token);
    const response = await authAxios.get(
      `/documents/${documentId}/annotations/`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching annotations for document ${documentId}:`,
      error
    );
    throw error;
  }
};

export const addAnnotation = async (documentId, content, type, page, token) => {
  try {
    const authAxios = createAuthenticatedAxios(token);
    const response = await authAxios.post(
      `/documents/${documentId}/create-annotation/`,
      {
        content,
        type,
        page,
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error adding annotation to document ${documentId}:`, error);
    throw error;
  }
};

export const updateAnnotation = async (
  documentId,
  annotationId,
  annotationData,
  token
) => {
  try {
    const authAxios = createAuthenticatedAxios(token);
    const response = await authAxios.put(
      `/documents/${documentId}/annotations/${annotationId}/`,
      annotationData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error updating annotation ${annotationId} for document ${documentId}:`,
      error
    );
    throw error;
  }
};

export const deleteAnnotation = async (documentId, annotationId, token) => {
  try {
    const authAxios = createAuthenticatedAxios(token);
    await authAxios.delete(
      `/documents/${documentId}/annotations/${annotationId}/`
    );
    return true;
  } catch (error) {
    console.error(
      `Error deleting annotation ${annotationId} for document ${documentId}:`,
      error
    );
    throw error;
  }
};

// Document search functionality
export const searchDocument = async (documentId, query, token) => {
  try {
    const authAxios = createAuthenticatedAxios(token);
    const response = await authAxios.get(`/documents/${documentId}/search/`, {
      params: { query },
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching document ${documentId}:`, error);
    throw error;
  }
};

// Document upload with metadata
export const uploadDocumentWithMetadata = async (file, metadata, token) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // Add metadata fields to form data
    Object.keys(metadata).forEach((key) => {
      formData.append(key, metadata[key]);
    });

    const authAxios = axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const response = await authAxios.post("/documents/upload/", formData);
    return response.data;
  } catch (error) {
    console.error("Error uploading document with metadata:", error);
    throw error;
  }
};
