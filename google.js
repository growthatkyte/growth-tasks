import { google } from "googleapis";

export async function getLatestDocContent(folderId) {
  const auth = new google.auth.GoogleAuth({
    // Aqui ele lê o JSON que você salvou no Secret do GitHub
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
    scopes: [
      "https://www.googleapis.com/auth/documents.readonly",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
    ],
  });

  const drive = google.drive({ version: "v3", auth });
  const docs = google.docs({ version: "v1", auth });

  // 1. Busca o arquivo mais recente na pasta
  const fileList = await drive.files.list({
    q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.document'`,
    orderBy: "createdTime desc",
    pageSize: 1,
    fields: "files(id, name)",
  });

  if (fileList.data.files.length === 0) {
    throw new Error("Nenhum documento encontrado na pasta!");
  }

  const latestDocId = fileList.data.files[0].id;
  console.log(`Lendo o documento: ${fileList.data.files[0].name}`);

  // 2. Lê o conteúdo desse documento específico
  const res = await docs.documents.get({ documentId: latestDocId });
  return res.data.body.content;
}
