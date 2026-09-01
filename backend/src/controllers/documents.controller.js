function createDocumentsController(documentsService) {
  function upload(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'É necessário enviar um arquivo no campo file.',
        });
      }

      return res.status(201).json(documentsService.createDocument(req.file));
    } catch (error) {
      return next(error);
    }
  }

  function list(req, res, next) {
    try {
      return res.status(200).json(documentsService.listDocuments());
    } catch (error) {
      return next(error);
    }
  }

  function download(req, res, next) {
    try {
      const document = documentsService.getDocumentForDownload(req.params.id);
      res.type(document.mimeType);

      return res.download(document.filePath, document.originalName, (error) => {
        if (error && !res.headersSent) {
          next(error);
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  return {
    upload,
    list,
    download,
  };
}

module.exports = { createDocumentsController };