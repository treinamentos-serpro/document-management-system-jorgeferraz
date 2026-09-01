const API_PREFIX = '/api';

async function parseResponse(response) {
  if (response.ok) {
    return response.status === 204 ? null : response.json();
  }

  const payload = await response.json().catch(() => ({}));
  throw new Error(payload.message || 'Não foi possível concluir a solicitação.');
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_PREFIX}/upload`, {
    method: 'POST',
    body: formData,
  });

  return parseResponse(response);
}

export async function listDocuments() {
  const response = await fetch(`${API_PREFIX}/documents`);
  return parseResponse(response);
}

export function getDownloadUrl(documentId) {
  return `${API_PREFIX}/documents/${encodeURIComponent(documentId)}/download`;
}