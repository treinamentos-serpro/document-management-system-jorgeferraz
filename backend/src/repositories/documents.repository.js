const fs = require('fs');
const path = require('path');

function resolveStoragePath(storagePath) {
  const resolvedStoragePath = path.resolve(storagePath || path.resolve(__dirname, '../../storage'));
  fs.mkdirSync(resolvedStoragePath, { recursive: true });
  return resolvedStoragePath;
}

function createDocumentsRepository(storagePath) {
  const resolvedStoragePath = resolveStoragePath(storagePath);
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
    return path.join(resolvedStoragePath, document.storedName);
  }

  function getStoragePath() {
    return resolvedStoragePath;
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
    getStoragePath,
    fileExists,
  };
}

module.exports = { createDocumentsRepository };