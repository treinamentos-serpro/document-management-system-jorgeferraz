const { randomUUID } = require('crypto');

function createDocumentsService(documentsRepository) {
  function toPublicMetadata(document) {
    const { storedName, ...publicMetadata } = document;
    return publicMetadata;
  }

  function createDocument(file) {
    const document = {
      id: randomUUID(),
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: 'default-user',
    };

    return toPublicMetadata(documentsRepository.create(document));
  }

  function listDocuments() {
    return documentsRepository.findAll().map(toPublicMetadata);
  }

  async function getDocumentForDownload(id) {
    const document = documentsRepository.findById(id);

    if (!document || !(await documentsRepository.fileExists(document))) {
      const error = new Error('Documento não encontrado.');
      error.code = 'DOCUMENT_NOT_FOUND';
      throw error;
    }

    return {
      filePath: documentsRepository.getFilePath(document),
      mimeType: document.mimeType,
      originalName: document.originalName,
    };
  }

  return {
    createDocument,
    listDocuments,
    getDocumentForDownload,
  };
}

module.exports = { createDocumentsService };