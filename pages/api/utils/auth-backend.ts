import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';

export function getUserFromToken(req: NextApiRequest) {
  let token = null;
  // Tenta pegar do header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Se não achar, tenta pegar do cookie
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sementesplay_secret') as any;
    return decoded;
  } catch (error) {
    return null;
  }
} 