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
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-16">
      <header className="mb-10 border-b border-slate-300 pb-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-teal-700">
          Gestão de arquivos
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Document Management System
        </h1>
      </header>
      <div className="space-y-8">
        <UploadComponent onUpload={handleUpload} />
        <DocumentList
          documents={documents}
          isLoading={isLoading}
          error={listError}
          onRetry={loadDocuments}
        />
      </div>
    </main>
  );
}
