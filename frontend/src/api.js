// src/api.js
import axios from 'axios';
import API_BASE_URL from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API calls for templates
api.createTemplate = (data) => api.post('/api/templates', data);
api.updateTemplate = (templateId, data) => api.put(`/api/templates/${templateId}`, data);
api.deleteTemplate = (templateId) => api.delete(`/api/templates/${templateId}`);
api.getTemplateById = (templateId) => api.get(`/api/templates/${templateId}`);

// API calls for sections
api.addSectionToTemplate = (templateId, data) => api.post(`/api/templates/${templateId}/sections`, data);
api.updateSection = (sectionId, data) => api.put(`/api/templates/sections/${sectionId}`, data);
api.deleteSection = (sectionId) => api.delete(`/api/templates/sections/${sectionId}`);

// API calls for subsections
api.addSubsectionToSection = (sectionId, data) => api.post(`/api/templates/sections/${sectionId}/subsections`, data);
api.updateSubsection = (subsectionId, data) => api.put(`/api/templates/subsections/${subsectionId}`, data);
api.deleteSubsection = (subsectionId) => api.delete(`/api/templates/subsections/${subsectionId}`);

// API calls for interactive elements
api.addInteractiveElementToSubsection = (subsectionId, data) => api.post(`/api/templates/subsections/${subsectionId}/elements`, data);
api.updateInteractiveElement = (elementId, data) => api.put(`/api/templates/elements/${elementId}`, data);
api.deleteInteractiveElement = (elementId) => api.delete(`/api/templates/elements/${elementId}`);

// API calls for reports (existing, but adding getReportById for clarity)
api.getReportById = (reportId) => api.get(`/api/reports/${reportId}`);

// API calls for template categories
api.getAllTemplateCategories = () => api.get('/api/template-categories');
api.createTemplateCategory = (data) => api.post('/api/template-categories', data);
api.deleteTemplateCategory = (categoryId) => api.delete(`/api/template-categories/${categoryId}`);

export default api;