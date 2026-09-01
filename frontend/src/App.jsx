import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { listDocuments, uploadDocument } from './services/documentsApi.js';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');

  async function loadDocuments() {
    setIsLoading(true);
    setListError('');

    try {
      setDocuments(await listDocuments());
    } catch (error) {
      setListError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleUpload(file) {
    const document = await uploadDocument(file);
    setDocuments((currentDocuments) => [...currentDocuments, document]);
  }

  return (
    <main>
      <h1>Document Management System</h1>
      <UploadComponent onUpload={handleUpload} />
      <DocumentList
        documents={documents}
        isLoading={isLoading}
        error={listError}
        onRetry={loadDocuments}
      />
    </main>
  );
}
