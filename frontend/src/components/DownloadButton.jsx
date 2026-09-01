import { getDownloadUrl } from '../services/documentsApi.js';

export default function DownloadButton({ documentId, documentName }) {
  return (
    <a href={getDownloadUrl(documentId)} download={documentName}>
      Baixar
    </a>
  );
}