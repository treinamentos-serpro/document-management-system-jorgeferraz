const path = require('path');
const { randomUUID } = require('crypto');
const express = require('express');
const multer = require('multer');
const { createDocumentsController } = require('../controllers/documents.controller');
const { createDocumentsRepository } = require('../repositories/documents.repository');
const { createDocumentsService } = require('../services/documents.service');

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;
const DEFAULT_STORAGE_PATH = path.resolve(__dirname, '../../storage');
const ALLOWED_FILE_EXTENSIONS = new Set([
  '.pdf',
  '.txt',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
]);

function getMaxFileSize() {
  const configuredSize = Number.parseInt(process.env.MAX_FILE_SIZE, 10);
  return Number.isSafeInteger(configuredSize) && configuredSize > 0
    ? configuredSize
    : DEFAULT_MAX_FILE_SIZE;
}

function isAllowedMimeType(mimeType) {
  if (typeof mimeType !== 'string') {
    return false;
  }

  return mimeType === 'application/pdf'
    || mimeType === 'text/plain'
    || mimeType.startsWith('image/');
}

function isAllowedFileExtension(fileName) {
  return ALLOWED_FILE_EXTENSIONS.has(path.extname(fileName || '').toLowerCase());
}

function createDocumentsRouter({
  storagePath = process.env.STORAGE_PATH || DEFAULT_STORAGE_PATH,
  documentsRepository,
} = {}) {
  const router = express.Router();
  const repository = documentsRepository || createDocumentsRepository(storagePath);

  if (typeof repository.getStoragePath !== 'function') {
    throw new Error('O repositório de documentos deve implementar getStoragePath.');
  }

  const uploadDestination = repository.getStoragePath();
  const upload = multer({
    storage: multer.diskStorage({
      destination: uploadDestination,
      filename: (req, file, callback) => {
        callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: getMaxFileSize(), files: 1 },
    fileFilter: (req, file, callback) => {
      const isAllowed = isAllowedMimeType(file.mimetype)
        && isAllowedFileExtension(file.originalname);

      if (isAllowed) {
        return callback(null, true);
      }

      const error = new Error('O tipo de arquivo enviado não é permitido.');
      error.code = 'UNSUPPORTED_MEDIA_TYPE';
      return callback(error);
    },
  });
  const documentsService = createDocumentsService(repository);
  const documentsController = createDocumentsController(documentsService);

  router.post('/upload', upload.single('file'), documentsController.upload);
  router.get('/documents', documentsController.list);
  router.get('/documents/:id/download', documentsController.download);

  router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'FILE_TOO_LARGE',
          message: 'O arquivo excede o tamanho máximo permitido.',
        });
      }

      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'A requisição de upload é inválida.',
      });
    }

    if (error.code === 'UNSUPPORTED_MEDIA_TYPE') {
      return res.status(415).json({
        error: error.code,
        message: error.message,
      });
    }

    if (error.code === 'DOCUMENT_NOT_FOUND') {
      return res.status(404).json({
        error: error.code,
        message: error.message,
      });
    }

    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Ocorreu um erro interno ao processar a solicitação.',
    });
  });

  return router;
}

module.exports = { createDocumentsRouter };