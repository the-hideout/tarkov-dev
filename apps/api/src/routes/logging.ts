import { Router } from 'express';
import { EventLog } from '@marksoftbot/database';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get logging settings for a guild
router.get('/settings/:guildId', authMiddleware, async (req, res) => {
  try {
    const { guildId } = req.params;
    const eventLog = await EventLog.findOne({
      userId: req.userId,
      guildId,
    });

    if (!eventLog) {
      return res.status(404).json({ error: 'Logging settings not found' });
    }

    res.json(eventLog.settings);
  } catch (error) {
    console.error('Logging settings error:', error);
    res.status(500).json({ error: 'Failed to fetch logging settings' });
  }
});

// Update logging settings
router.put('/settings/:guildId', authMiddleware, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { settings } = req.body;

    const eventLog = await EventLog.findOneAndUpdate(
      { userId: req.userId, guildId },
      { $set: { settings } },
      { new: true, upsert: true }
    );

    res.json(eventLog.settings);
  } catch (error) {
    console.error('Logging settings update error:', error);
    res.status(500).json({ error: 'Failed to update logging settings' });
  }
});

// Get events with filtering
router.get('/events/:guildId', authMiddleware, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { type, startDate, endDate, limit = 50 } = req.query;

    const query = {
      userId: req.userId,
      guildId,
      ...(type && { 'events.type': type }),
      ...(startDate && { 'events.timestamp': { $gte: new Date(startDate as string) } }),
      ...(endDate && { 'events.timestamp': { $lte: new Date(endDate as string) } }),
    };

    const eventLog = await EventLog.findOne(query);

    if (!eventLog) {
      return res.json([]);
    }

    let events = eventLog.events;
    if (type) {
      events = events.filter(event => event.type === type);
    }
    if (startDate) {
      events = events.filter(event => event.timestamp >= new Date(startDate as string));
    }
    if (endDate) {
      events = events.filter(event => event.timestamp <= new Date(endDate as string));
    }

    // Sort by timestamp descending and limit results
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    events = events.slice(0, Number(limit));

    res.json(events);
  } catch (error) {
    console.error('Event log fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch event logs' });
  }
});

export default router; 