const fs = require('fs');
const path = require('path');

function createDocumentsRepository(storagePath) {
  const documents = new Map();

  function create(document) {
    documents.set(document.id, document);
    return document;
  }

  function findAll() {
    return Array.from(documents.values());
  }

  function findById(id) {
    return documents.get(id) || null;
  }

  function getFilePath(document) {
    return path.join(storagePath, document.storedName);
  }

  async function fileExists(document) {
    try {
      await fs.promises.access(getFilePath(document), fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  return {
    create,
    findAll,
    findById,
    getFilePath,
    fileExists,
  };
}

module.exports = { createDocumentsRepository };