import { useState } from 'react';

export default function UploadComponent({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      event.currentTarget.reset();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(event) {
    setSelectedFile(event.target.files[0] || null);
    setError('');
  }

  return (
    <section
      className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      aria-labelledby="upload-title"
    >
      <h2 id="upload-title" className="text-xl font-semibold text-slate-950">
        Enviar documento
      </h2>
      <form className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="document-file">
            Arquivo
          </label>
          <input
            className="block w-full cursor-pointer border border-slate-300 bg-slate-50 text-sm text-slate-700 file:mr-4 file:border-0 file:bg-teal-700 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            id="document-file"
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
        <button
          className="bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-teal-400"
          type="submit"
          disabled={isUploading}
        >
          {isUploading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      {error && (
        <p className="mt-4 border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}