import { Router } from 'express';
import { Loyalty } from '@marksoftbot/database';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get loyalty settings
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const loyalty = await Loyalty.findOne({
      userId: req.userId,
      channelId: req.query.channelId,
    });

    if (!loyalty) {
      return res.status(404).json({ error: 'Loyalty settings not found' });
    }

    res.json(loyalty.settings);
  } catch (error) {
    console.error('Loyalty settings error:', error);
    res.status(500).json({ error: 'Failed to fetch loyalty settings' });
  }
});

// Update loyalty settings
router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const { channelId, settings } = req.body;

    const loyalty = await Loyalty.findOneAndUpdate(
      { userId: req.userId, channelId },
      { $set: { settings } },
      { new: true, upsert: true }
    );

    res.json(loyalty.settings);
  } catch (error) {
    console.error('Loyalty settings update error:', error);
    res.status(500).json({ error: 'Failed to update loyalty settings' });
  }
});

// Get channel rewards
router.get('/rewards', authMiddleware, async (req, res) => {
  try {
    const loyalty = await Loyalty.findOne({
      userId: req.userId,
      channelId: req.query.channelId,
    });

    if (!loyalty) {
      return res.status(404).json({ error: 'Loyalty rewards not found' });
    }

    res.json(loyalty.rewards);
  } catch (error) {
    console.error('Loyalty rewards error:', error);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

// Create new reward
router.post('/rewards', authMiddleware, async (req, res) => {
  try {
    const { channelId, reward } = req.body;

    const loyalty = await Loyalty.findOneAndUpdate(
      { userId: req.userId, channelId },
      { 
        $push: { 
          rewards: {
            ...reward,
            id: new mongoose.Types.ObjectId().toString(),
          }
        }
      },
      { new: true }
    );

    res.json(loyalty.rewards[loyalty.rewards.length - 1]);
  } catch (error) {
    console.error('Loyalty reward creation error:', error);
    res.status(500).json({ error: 'Failed to create reward' });
  }
});

// Update reward
router.put('/rewards/:rewardId', authMiddleware, async (req, res) => {
  try {
    const { channelId, reward } = req.body;
    const { rewardId } = req.params;

    const loyalty = await Loyalty.findOneAndUpdate(
      { 
        userId: req.userId, 
        channelId,
        'rewards.id': rewardId
      },
      { 
        $set: { 
          'rewards.$': {
            ...reward,
            id: rewardId,
          }
        }
      },
      { new: true }
    );

    res.json(loyalty.rewards.find(r => r.id === rewardId));
  } catch (error) {
    console.error('Loyalty reward update error:', error);
    res.status(500).json({ error: 'Failed to update reward' });
  }
});

export default router; 