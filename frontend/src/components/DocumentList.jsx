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
    <section aria-labelledby="documents-title">
      <h2 id="documents-title">Documentos</h2>
      {isLoading && <p>Carregando documentos...</p>}
      {!isLoading && error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={onRetry}>Tentar novamente</button>
        </div>
      )}
      {!isLoading && !error && documents.length === 0 && (
        <p>Nenhum documento enviado.</p>
      )}
      {!isLoading && !error && documents.length > 0 && (
        <table>
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">Tamanho</th>
              <th scope="col">Enviado em</th>
              <th scope="col">Ação</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id}>
                <td>{document.originalName}</td>
                <td>{formatFileSize(document.size)}</td>
                <td>{formatUploadDate(document.uploadedAt)}</td>
                <td>
                  <DownloadButton
                    documentId={document.id}
                    documentName={document.originalName}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}