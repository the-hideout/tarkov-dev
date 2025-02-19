import { Router } from 'express';
import { Analytics } from '@marksoftbot/database';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get analytics data with timeframe filter
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { timeframe = '7d', platform } = req.query;
    const userId = req.userId;

    // Calculate date range based on timeframe
    const now = new Date();
    const startDate = new Date(now);
    switch (timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        return res.status(400).json({ error: 'Invalid timeframe' });
    }

    const query = {
      userId,
      ...(platform && { platform }),
      'metrics.chatActivity.date': { $gte: startDate },
    };

    const analytics = await Analytics.find(query);
    
    // Transform data for frontend
    const transformedData = {
      chatActivity: [],
      commandUsage: [],
      userGrowth: [],
      topChatters: [],
    };

    // Aggregate data from all channels
    analytics.forEach(channelData => {
      // Merge chat activity
      transformedData.chatActivity.push(...channelData.metrics.chatActivity
        .filter(activity => activity.date >= startDate)
        .map(({ date, messages, users }) => ({
          date: date.toISOString().split('T')[0],
          messages,
          users,
        })));

      // Merge command usage
      channelData.metrics.commandUsage.forEach(cmd => {
        const existingCmd = transformedData.commandUsage.find(c => c.command === cmd.command);
        if (existingCmd) {
          existingCmd.uses += cmd.uses;
        } else {
          transformedData.commandUsage.push({ command: cmd.command, uses: cmd.uses });
        }
      });

      // Merge user growth
      transformedData.userGrowth.push(...channelData.metrics.userGrowth
        .filter(growth => growth.date >= startDate)
        .map(({ date, followers, subscribers }) => ({
          date: date.toISOString().split('T')[0],
          followers,
          subscribers,
        })));

      // Merge user stats
      channelData.metrics.userStats.forEach(user => {
        const existingUser = transformedData.topChatters.find(u => u.username === user.username);
        if (existingUser) {
          existingUser.messages += user.messages;
        } else {
          transformedData.topChatters.push({
            username: user.username,
            messages: user.messages,
          });
        }
      });
    });

    // Sort and limit data
    transformedData.commandUsage.sort((a, b) => b.uses - a.uses).slice(0, 10);
    transformedData.topChatters.sort((a, b) => b.messages - a.messages).slice(0, 10);

    res.json(transformedData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router; 