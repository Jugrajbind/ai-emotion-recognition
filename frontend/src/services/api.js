/**
 * Frontend API Service for AI Emotion Recognition System.
 * Connects to FastAPI backend with JWT token interceptors and error handling.
 */

const API_BASE = '/api';

class ApiService {
  getToken() {
    return localStorage.getItem('emotion_ai_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('emotion_ai_token', token);
    } else {
      localStorage.removeItem('emotion_ai_token');
    }
  }

  getHeaders(isMultipart = false) {
    const headers = {};
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async handleResponse(response) {
    if (!response.ok) {
      let errorMsg = 'An unexpected error occurred.';
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorMsg;
      } catch (e) {
        errorMsg = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMsg);
    }
    return await response.json();
  }

  // ==================== Health & System ====================
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return this.handleResponse(res);
  }

  // ==================== Auth ====================
  async register(username, email, password, fullName = '') {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        email,
        password,
        full_name: fullName,
      }),
    });
    const data = await this.handleResponse(res);
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await this.handleResponse(res);
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: this.getHeaders(),
      });
      return await this.handleResponse(res);
    } catch (err) {
      this.setToken(null);
      return null;
    }
  }

  logout() {
    this.setToken(null);
  }

  // ==================== Emotion Recognition ====================
  async analyzeText(text) {
    const res = await fetch(`${API_BASE}/emotions/text`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text }),
    });
    return this.handleResponse(res);
  }

  async analyzeFace(imageBase64) {
    const res = await fetch(`${API_BASE}/emotions/face`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ image_base64: imageBase64 }),
    });
    return this.handleResponse(res);
  }

  async analyzeVoice(audioBlob, filename = 'recording.wav') {
    const formData = new FormData();
    formData.append('file', audioBlob, filename);

    const res = await fetch(`${API_BASE}/emotions/voice`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData,
    });
    return this.handleResponse(res);
  }

  async analyzeMultimodal(text, imageBase64, textWeight = 0.5, faceWeight = 0.5) {
    const res = await fetch(`${API_BASE}/emotions/multimodal`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        text,
        image_base64: imageBase64,
        text_weight: textWeight,
        face_weight: faceWeight,
      }),
    });
    return this.handleResponse(res);
  }

  // ==================== History & Analytics ====================
  async getHistory(modality = null, emotion = null, page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });
    if (modality && modality !== 'all') params.append('modality', modality);
    if (emotion && emotion !== 'all') params.append('emotion', emotion);

    const res = await fetch(`${API_BASE}/history?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async deleteHistoryItem(id) {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async clearAllHistory() {
    const res = await fetch(`${API_BASE}/history`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  getExportCsvUrl() {
    return `${API_BASE}/history/export/csv`;
  }

  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }
}

export const api = new ApiService();
