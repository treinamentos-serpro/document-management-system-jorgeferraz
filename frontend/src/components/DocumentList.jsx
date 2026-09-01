import DownloadButton from './DownloadButton.jsx';

function formatFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }

  return `${(size / 1024).toFixed(1)} KB`;
}

function formatUploadDate(uploadedAt) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(uploadedAt));
}

export default function DocumentList({ documents, isLoading, error, onRetry }) {
  return (
    <section className="border border-slate-200 bg-white shadow-sm" aria-labelledby="documents-title">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-8">
        <h2 id="documents-title" className="text-xl font-semibold text-slate-950">Documentos</h2>
        {!isLoading && !error && (
          <span className="bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
            {documents.length}
          </span>
        )}
      </div>
      {isLoading && <p className="px-6 py-8 text-sm text-slate-600 sm:px-8">Carregando documentos...</p>}
      {!isLoading && error && (
        <div className="m-6 border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800 sm:m-8" role="alert">
          <p className="font-medium">{error}</p>
          <button className="mt-3 font-semibold underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2" type="button" onClick={onRetry}>Tentar novamente</button>
        </div>
      )}
      {!isLoading && !error && documents.length === 0 && (
        <p className="px-6 py-10 text-center text-sm text-slate-600 sm:px-8">Nenhum documento enviado.</p>
      )}
      {!isLoading && !error && documents.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-100">
            <tr>
              <th className="px-6 py-3 font-semibold sm:px-8" scope="col">Nome</th>
              <th className="px-6 py-3 font-semibold" scope="col">Tamanho</th>
              <th className="px-6 py-3 font-semibold" scope="col">Enviado em</th>
              <th className="px-6 py-3 font-semibold sm:px-8" scope="col">Ação</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr className="border-t border-slate-200 text-slate-700 transition-colors hover:bg-teal-50" key={document.id}>
                <td className="max-w-xs truncate px-6 py-4 font-medium text-slate-900 sm:px-8">{document.originalName}</td>
                <td className="whitespace-nowrap px-6 py-4">{formatFileSize(document.size)}</td>
                <td className="whitespace-nowrap px-6 py-4">{formatUploadDate(document.uploadedAt)}</td>
                <td className="px-6 py-4 sm:px-8">
                  <DownloadButton
                    documentId={document.id}
                    documentName={document.originalName}
                  />
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}
    </section>
  );
}