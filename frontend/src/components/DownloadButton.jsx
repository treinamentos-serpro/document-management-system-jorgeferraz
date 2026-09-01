import { getDownloadUrl } from '../services/documentsApi.js';

export default function DownloadButton({ documentId, documentName }) {
  return (
    <a
      className="inline-flex whitespace-nowrap border border-teal-700 px-3 py-1.5 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
      href={getDownloadUrl(documentId)}
      download={documentName}
    >
      Baixar
    </a>
  );
}