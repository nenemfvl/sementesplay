import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import { prisma } from '../../../lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const form = formidable({
    uploadDir: path.join(process.cwd(), 'public/avatars'),
    keepExtensions: true,
    maxFileSize: 2 * 1024 * 1024, // 2MB
  });

  await fs.mkdir(path.join(process.cwd(), 'public/avatars'), { recursive: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Erro no upload da imagem' });
    }
    const fileField = files.avatar;
    const file = Array.isArray(fileField) ? fileField[0] : fileField;
    if (!file) {
      return res.status(400).json({ error: 'Arquivo não enviado' });
    }
    // Aqui você pode pegar o ID do usuário autenticado (exemplo simplificado)
    const usuarioId = fields.usuarioId as string;
    if (!usuarioId) {
      return res.status(400).json({ error: 'Usuário não autenticado' });
    }
    // Salvar o caminho relativo
    const avatarUrl = `/avatars/${path.basename(file.filepath)}`;
    // Atualizar o usuário no banco
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { avatarUrl },
    });
    return res.status(200).json({ avatarUrl });
  });
} 