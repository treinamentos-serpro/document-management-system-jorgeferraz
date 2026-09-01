function createDocumentsController(documentsService) {
  function withErrorHandling(handler) {
    return function controllerHandler(req, res, next) {
      Promise.resolve()
        .then(() => handler(req, res, next))
        .catch(next);
    };
  }

  const upload = withErrorHandling((req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'É necessário enviar um arquivo no campo file.',
      });
    }

    return res.status(201).json(documentsService.createDocument(req.file));
  });

  const list = withErrorHandling((req, res) => {
    return res.status(200).json(documentsService.listDocuments());
  });

  const download = withErrorHandling(async (req, res, next) => {
    const document = await documentsService.getDocumentForDownload(req.params.id);
    res.type(document.mimeType);

    return res.download(document.filePath, document.originalName, (error) => {
      if (error && !res.headersSent) {
        next(error);
      }
    });
  });

  return {
    upload,
    list,
    download,
  };
}

module.exports = { createDocumentsController };