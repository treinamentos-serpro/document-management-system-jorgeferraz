# Especificação Completa - Document Management System

## 1. Objetivo

Disponibilizar uma aplicação web para enviar, listar e baixar documentos, com
arquivos armazenados exclusivamente no filesystem local e metadados mantidos em
memória durante a execução da aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de um arquivo por requisição.
- Listagem dos metadados dos documentos enviados na execução atual.
- Download de um documento pelo identificador.
- Gestão simples de documentos de um proprietário padrão.
- Interface React que consome o backend pelo prefixo `/api`.

### Fora do escopo

- Autenticação, sessões e autorização real por usuário.
- Persistência de metadados em banco de dados ou arquivo.
- Armazenamento externo ou em nuvem.
- Edição, exclusão, busca e paginação de documentos.
- Versionamento de documentos.
- Compartilhamento de documentos entre usuários.

## 3. Requisitos funcionais

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RF-01 | O usuário pode enviar um documento. | Ao receber um arquivo válido, o sistema o grava localmente e retorna os metadados criados com status `201`. |
| RF-02 | O usuário pode listar os documentos enviados. | A listagem retorna, com status `200`, todos os metadados em memória da execução atual, sem expor nome físico ou caminho local. |
| RF-03 | O usuário pode baixar um documento pelo identificador. | Para um `id` existente, o sistema devolve o conteúdo binário como anexo, preservando o nome original; para um `id` inexistente, retorna `404`. |
| RF-04 | O sistema atribui um proprietário padrão ao documento. | Todo metadado criado possui `owner` igual a `default-user`; nenhum endpoint recebe nem filtra documentos por proprietário nesta fase. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser gravados exclusivamente no filesystem local por `multer` com `diskStorage`. |
| RNF-02 | O diretório de armazenamento deve ser definido por `STORAGE_PATH`, com padrão `backend/storage`. |
| RNF-03 | Os metadados devem existir somente em memória e são perdidos ao reiniciar o backend. |
| RNF-04 | O backend deve seguir a dependência `routes -> controllers -> services -> repositories`, sem dependência inversa entre camadas. |
| RNF-05 | Configurações operacionais devem usar variáveis de ambiente, conforme o princípio 12-Factor App. |
| RNF-06 | O tamanho máximo por arquivo é de 10 MB, configurável por `MAX_FILE_SIZE` em bytes, com padrão `10485760`. |
| RNF-07 | São aceitos somente arquivos `application/pdf`, `image/*` e `text/plain`. |
| RNF-08 | Símbolos de código devem usar inglês; mensagens de erro retornadas ao cliente devem usar português. |
| RNF-09 | O frontend deve chamar a API pelo prefixo `/api`; o proxy do Vite encaminha as chamadas ao backend local sem esse prefixo. |

## 5. Modelo de dados (metadados do documento)

### DocumentMetadata

| Campo | Tipo | Exposto pela API | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador único gerado pelo sistema. |
| `originalName` | string | Sim | Nome do arquivo informado pelo cliente no upload. |
| `storedName` | string | Não | Nome físico único atribuído ao arquivo no armazenamento local. |
| `mimeType` | string | Sim | Tipo MIME validado do arquivo enviado. |
| `size` | number | Sim | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Sim | Data e hora do upload no formato ISO 8601. |
| `owner` | string | Sim | Proprietário fixo `default-user` nesta fase. |

O repositório mantém um índice em memória de `DocumentMetadata`. O caminho físico
do arquivo é resolvido somente pelo backend, usando `STORAGE_PATH` e `storedName`.
O cliente nunca informa caminhos locais e a API nunca os expõe.

Exemplo de metadado público:

```json
{
  "id": "8d6e7007-84d2-4a28-887e-9775d4972f8d",
  "originalName": "relatorio.pdf",
  "mimeType": "application/pdf",
  "size": 245760,
  "uploadedAt": "2026-09-01T14:30:00.000Z",
  "owner": "default-user"
}
```

## 6. Contratos de API

O backend expõe as rotas abaixo sem prefixo. Durante o desenvolvimento, o
frontend deve usar as rotas equivalentes com `/api`, pois o proxy do Vite remove
esse prefixo antes de encaminhar a requisição para `http://localhost:3000`.

### Formato de erro

Erros da API devem usar JSON com os campos abaixo, sem revelar stack trace,
caminhos locais ou detalhes internos.

```json
{
  "error": "VALIDATION_ERROR",
  "message": "É necessário enviar um arquivo no campo file."
}
```

### POST /upload

- Rota do frontend: `POST /api/upload`
- Rota do backend: `POST /upload`
- Content-Type: `multipart/form-data`
- Campo obrigatório: `file`, contendo exatamente um arquivo.
- Campos adicionais: ignorados nesta fase; `owner` é sempre atribuído pelo sistema como `default-user`.

O arquivo deve ter no máximo `MAX_FILE_SIZE` bytes e tipo MIME `application/pdf`,
`image/*` ou `text/plain`.

Resposta de sucesso:

- Status: `201 Created`
- Content-Type: `application/json`
- Corpo: metadado público do documento criado.

```json
{
  "id": "8d6e7007-84d2-4a28-887e-9775d4972f8d",
  "originalName": "relatorio.pdf",
  "mimeType": "application/pdf",
  "size": 245760,
  "uploadedAt": "2026-09-01T14:30:00.000Z",
  "owner": "default-user"
}
```

Falhas:

| Status | `error` | Condição |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | Requisição multipart inválida, campo `file` ausente ou mais de um arquivo enviado. |
| `413` | `FILE_TOO_LARGE` | Arquivo maior que `MAX_FILE_SIZE`. |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | Tipo MIME não permitido. |
| `500` | `INTERNAL_ERROR` | Falha inesperada ao processar ou registrar o upload. |

### GET /documents

- Rota do frontend: `GET /api/documents`
- Rota do backend: `GET /documents`
- Entrada: não possui corpo nem parâmetros obrigatórios.

Resposta de sucesso:

- Status: `200 OK`
- Content-Type: `application/json`
- Corpo: array de metadados públicos, possivelmente vazio.

```json
[
  {
    "id": "8d6e7007-84d2-4a28-887e-9775d4972f8d",
    "originalName": "relatorio.pdf",
    "mimeType": "application/pdf",
    "size": 245760,
    "uploadedAt": "2026-09-01T14:30:00.000Z",
    "owner": "default-user"
  }
]
```

Falhas:

| Status | `error` | Condição |
| --- | --- | --- |
| `500` | `INTERNAL_ERROR` | Falha inesperada ao recuperar os metadados. |

### GET /documents/:id/download

- Rota do frontend: `GET /api/documents/:id/download`
- Rota do backend: `GET /documents/:id/download`
- Parâmetro de rota obrigatório: `id`, identificador do documento criado no upload.
- Entrada: não possui corpo.

Resposta de sucesso:

- Status: `200 OK`
- Content-Type: igual ao `mimeType` salvo no metadado.
- Header `Content-Disposition`: `attachment` com o nome original do arquivo.
- Corpo: conteúdo binário do arquivo.

Falhas:

| Status | `error` | Condição |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | Identificador ausente ou em formato inválido. |
| `404` | `DOCUMENT_NOT_FOUND` | Não há metadado para o identificador ou o arquivo local correspondente não existe. |
| `500` | `INTERNAL_ERROR` | Falha inesperada ao preparar ou transmitir o arquivo. |

### GET /health

O endpoint já existente é mantido para verificação de disponibilidade do backend.

- Rota: `GET /health`
- Resposta: `200 OK` com `{ "status": "ok" }`.

## 7. Decisões arquiteturais

### Backend

O backend usa Node.js, Express e CommonJS. A organização segue uma Clean
Architecture simples, respeitando o fluxo abaixo:

```text
routes -> controllers -> services -> repositories
```

| Camada | Responsabilidade |
| --- | --- |
| `routes/` | Registra endpoints e conecta o middleware de upload às ações do controller. |
| `controllers/` | Lê entrada HTTP, realiza validação básica, chama o serviço e traduz resultados em respostas HTTP. |
| `services/` | Aplica regras de negócio, valida o documento, monta metadados e coordena as operações. |
| `repositories/` | Mantém o índice de metadados em memória e executa o acesso ao filesystem local. |

`multer` é um adaptador na borda HTTP: sua configuração usa `diskStorage`, grava
o arquivo em `STORAGE_PATH` e aplica os limites de tamanho e tipo. O serviço e o
repositório não devem depender de objetos `req` ou `res` do Express.

### Frontend

O frontend usa React com componentes funcionais e Hooks, organizado em
`components/`, `pages/` e `services/`. A comunicação HTTP fica em serviços que
usam `fetch` com rotas iniciadas por `/api`.

### Armazenamento e segurança

- Não utilizar provedores externos, serviços de upload de terceiros ou banco de dados.
- Criar nomes físicos únicos e seguros; o nome original é somente metadado público.
- Validar tamanho e tipo MIME antes da aceitação definitiva do upload.
- Resolver arquivos para download exclusivamente a partir do `id` encontrado no índice interno.
- Não concatenar valores fornecidos pelo cliente para formar caminhos do filesystem.
- Não expor `storedName`, `STORAGE_PATH`, caminhos físicos ou detalhes internos nas respostas de erro.

## 8. Plano de execução

As etapas abaixo descrevem a implementação futura; este documento não executa
nenhuma delas.

1. Definir a configuração do backend: `PORT`, `STORAGE_PATH` e `MAX_FILE_SIZE`; garantir a disponibilidade do diretório local de armazenamento.
2. Criar o repositório de documentos com índice em memória, geração de identificadores e operações para inserir, listar e localizar metadados/arquivos.
3. Configurar `multer` com `diskStorage`, limite de 10 MB e filtro para PDF, imagens e texto simples.
4. Implementar os serviços de upload, listagem e download com regras de negócio e sem dependência direta de Express.
5. Implementar controllers, rotas e tratamento HTTP padronizado para os contratos definidos nesta especificação.
6. Criar testes de backend com `node:test` para fluxos de sucesso e falhas de validação, tamanho, tipo e documento inexistente.
7. Criar no frontend os serviços `fetch`, componentes e páginas para enviar arquivo, listar documentos e iniciar downloads pelo proxy `/api`.
8. Integrar frontend e backend, validando as respostas, estados de erro e o download no navegador.
9. Executar testes e uma validação manual dos três fluxos principais, confirmando que arquivos permanecem no armazenamento local e metadados não persistem após reinício.