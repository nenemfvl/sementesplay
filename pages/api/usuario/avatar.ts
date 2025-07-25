import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import cloudinary from '../../../lib/cloudinary';
import { prisma } from '../../../lib/prisma';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'Erro no upload' });

    const fileField = files.avatar;
    const file = Array.isArray(fileField) ? fileField[0] : fileField;
    if (!file) return res.status(400).json({ error: 'Arquivo não enviado' });

    const usuarioIdField = fields.usuarioId;
    const usuarioId = Array.isArray(usuarioIdField) ? usuarioIdField[0] : usuarioIdField;
    if (!usuarioId) return res.status(400).json({ error: 'Usuário não autenticado' });

    // Upload para o Cloudinary
    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: 'avatars',
      public_id: usuarioId,
      overwrite: true,
      resource_type: 'image',
    });

    // Atualizar o usuário no banco
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { avatarUrl: result.secure_url },
    });

    return res.status(200).json({ avatarUrl: result.secure_url });
  });
} 