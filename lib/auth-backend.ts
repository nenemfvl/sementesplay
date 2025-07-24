import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';

export function getUserFromToken(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'sementesplay_secret') as any;
  } catch {
    return null;
  }
} 