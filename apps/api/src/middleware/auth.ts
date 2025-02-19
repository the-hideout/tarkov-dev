import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@marksoftbot/database';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const userId = await AuthService.verifyToken(token);
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
} 