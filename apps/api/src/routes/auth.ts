import { Router } from 'express';
import { AuthService } from '@marksoftbot/database';

const router = Router();

router.get('/twitch/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Invalid code' });
    }

    const token = await AuthService.handleTwitchAuth(code);
    res.redirect(`/dashboard?token=${token}`);
  } catch (error) {
    console.error('Twitch callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.get('/discord/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Invalid code' });
    }

    const token = await AuthService.handleDiscordAuth(code);
    res.redirect(`/dashboard?token=${token}`);
  } catch (error) {
    console.error('Discord callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router; 