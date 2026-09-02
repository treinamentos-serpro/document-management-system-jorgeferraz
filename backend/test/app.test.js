const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const express = require('express');
const app = require('../src/app');
const { createDocumentsRouter } = require('../src/routes/documents.routes');

function createTestContext() {
  const storagePath = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-storage-'));
  const testApp = express();

  testApp.use(express.json());
  testApp.use(createDocumentsRouter({ storagePath }));

  return {
    storagePath,
    testApp,
  };
}

async function withRunningServer(testApp, callback) {
  const server = testApp.listen(0);
  await once(server, 'listening');
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await callback(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('POST /upload envia documento com sucesso', async () => {
  const { storagePath, testApp } = createTestContext();

  try {
    await withRunningServer(testApp, async (baseUrl) => {
      const formData = new FormData();
      formData.append(
        'file',
        new Blob(['conteúdo do documento'], { type: 'text/plain' }),
        'documento.txt',
      );

      const response = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json();

      assert.strictEqual(response.status, 201);
      assert.strictEqual(payload.originalName, 'documento.txt');
      assert.strictEqual(payload.mimeType, 'text/plain');
      assert.strictEqual(payload.owner, 'default-user');
      assert.strictEqual(typeof payload.id, 'string');
      assert.ok(payload.uploadedAt);
    });
  } finally {
    fs.rmSync(storagePath, { recursive: true, force: true });
  }
});

test('GET /documents retorna documentos enviados', async () => {
  const { storagePath, testApp } = createTestContext();

  try {
    await withRunningServer(testApp, async (baseUrl) => {
      const formData = new FormData();
      formData.append(
        'file',
        new Blob(['conteúdo para listagem'], { type: 'text/plain' }),
        'lista.txt',
      );

      const uploadResponse = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      const uploadedDocument = await uploadResponse.json();

      const listResponse = await fetch(`${baseUrl}/documents`);
      const documents = await listResponse.json();

      assert.strictEqual(uploadResponse.status, 201);
      assert.strictEqual(listResponse.status, 200);
      assert.strictEqual(documents.length, 1);
      assert.strictEqual(documents[0].id, uploadedDocument.id);
      assert.strictEqual(documents[0].originalName, 'lista.txt');
    });
  } finally {
    fs.rmSync(storagePath, { recursive: true, force: true });
  }
});

test('GET /documents/:id/download baixa o arquivo enviado', async () => {
  const { storagePath, testApp } = createTestContext();

  try {
    await withRunningServer(testApp, async (baseUrl) => {
      const formData = new FormData();
      formData.append(
        'file',
        new Blob(['conteúdo para download'], { type: 'text/plain' }),
        'download.txt',
      );

      const uploadResponse = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      const uploadedDocument = await uploadResponse.json();

      const downloadResponse = await fetch(
        `${baseUrl}/documents/${uploadedDocument.id}/download`,
      );
      const content = await downloadResponse.text();
      const disposition = downloadResponse.headers.get('content-disposition');

      assert.strictEqual(uploadResponse.status, 201);
      assert.strictEqual(downloadResponse.status, 200);
      assert.ok(disposition.includes('filename="download.txt"'));
      assert.strictEqual(content, 'conteúdo para download');
    });
  } finally {
    fs.rmSync(storagePath, { recursive: true, force: true });
  }
});
