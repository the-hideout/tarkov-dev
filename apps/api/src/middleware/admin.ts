import { Request, Response, NextFunction } from 'express';
import { User } from '@marksoftbot/database';

export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Admin check failed' });
  }
} 