import { ChatUserstate } from 'tmi.js';
import { Redis } from 'ioredis';
import { LoyaltyService } from '@marksoftbot/core';
import { config } from '../../config';

const redis = new Redis(config.redis.url);

export const name = 'boss';
export const cooldown = 600; // 10 minutes between boss battles
export const userLevel = 'everyone';

interface BossData {
  name: string;
  health: number;
  maxHealth: number;
  level: number;
  participants: {
    username: string;
    damage: number;
    points: number;
  }[];
  startTime: number;
  status: 'recruiting' | 'active' | 'ended';
}

const BOSSES = [
  { 
    name: 'Dragon', 
    baseHealth: 10000,
    abilities: ['Flame Breath', 'Wing Gust', 'Tail Swipe'],
    minReward: 1.2,
    maxReward: 2.0
  },
  { 
    name: 'Giant', 
    baseHealth: 8000,
    abilities: ['Boulder Throw', 'Ground Slam', 'Tree Swing'],
    minReward: 1.3,
    maxReward: 1.8
  },
  { 
    name: 'Kraken', 
    baseHealth: 12000,
    abilities: ['Tentacle Grab', 'Whirlpool', 'Ink Cloud'],
    minReward: 1.5,
    maxReward: 2.2
  }
];

export async function execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void> {
  const channelName = channel.replace('#', '');
  const loyaltyService = new LoyaltyService();

  try {
    const points = parseInt(args[0]);

    // Check if there's an active boss battle
    const activeBoss = await redis.get(`boss:${channelName}`);
    if (activeBoss) {
      const boss: BossData = JSON.parse(activeBoss);
      
      if (boss.status === 'recruiting') {
        // Join existing battle
        if (isNaN(points) || points < 100) {
          await this.client.say(channel, `@${userstate.username} Minimum entry is 100 points.`);
          return;
        }

        // Check if already joined
        if (boss.participants.some(p => p.username === userstate.username)) {
          await this.client.say(channel, `@${userstate.username} You're already in this battle!`);
          return;
        }

        // Check points
        const userPoints = await loyaltyService.getPoints({
          userId: channelName,
          channelId: channelName,
          targetUserId: userstate['user-id']!
        });

        if (userPoints < points) {
          await this.client.say(channel, 
            `@${userstate.username} You need ${points} points to join. You have ${userPoints} points.`
          );
          return;
        }

        // Remove points and add to battle
        await loyaltyService.removePoints({
          userId: channelName,
          channelId: channelName,
          targetUserId: userstate['user-id']!,
          points,
          reason: 'boss_entry'
        });

        boss.participants.push({
          username: userstate.username!,
          damage: 0,
          points
        });

        await redis.set(`boss:${channelName}`, JSON.stringify(boss));
        await this.client.say(channel, 
          `@${userstate.username} joined the battle with ${points} points! ` +
          `Total warriors: ${boss.participants.length}`
        );

        return;
      }

      // If battle is active, show status
      if (boss.status === 'active') {
        const healthPercent = Math.round((boss.health / boss.maxHealth) * 100);
        await this.client.say(channel, 
          `${boss.name} (Level ${boss.level}) | ` +
          `Health: ${boss.health}/${boss.maxHealth} (${healthPercent}%) | ` +
          `Warriors: ${boss.participants.length}`
        );
      }
      return;
    }

    // Start new boss battle
    if (isNaN(points) || points < 100) {
      await this.client.say(channel, `@${userstate.username} Minimum entry is 100 points.`);
      return;
    }

    // Check points
    const userPoints = await loyaltyService.getPoints({
      userId: channelName,
      channelId: channelName,
      targetUserId: userstate['user-id']!
    });

    if (userPoints < points) {
      await this.client.say(channel, 
        `@${userstate.username} You need ${points} points to start a battle. You have ${userPoints} points.`
      );
      return;
    }

    // Get boss level from previous victories
    const bossLevel = parseInt(await redis.get(`bosslevel:${channelName}`)) || 1;
    const selectedBoss = BOSSES[Math.floor(Math.random() * BOSSES.length)];

    // Create boss battle
    const boss: BossData = {
      name: selectedBoss.name,
      health: selectedBoss.baseHealth * (1 + (bossLevel - 1) * 0.5),
      maxHealth: selectedBoss.baseHealth * (1 + (bossLevel - 1) * 0.5),
      level: bossLevel,
      participants: [{
        username: userstate.username!,
        damage: 0,
        points
      }],
      startTime: Date.now(),
      status: 'recruiting'
    };

    await redis.set(`boss:${channelName}`, JSON.stringify(boss));
    await this.client.say(channel, 
      `⚔️ A Level ${bossLevel} ${boss.name} appears! ${userstate.username} prepares to fight with ${points} points! ` +
      `Type !boss <points> to join the battle in the next 60 seconds!`
    );

    // Start battle after recruitment period
    setTimeout(async () => {
      await startBattle(channel, channelName);
    }, 60000);

  } catch (error) {
    console.error('Error handling boss command:', error);
    throw error;
  }
}

async function startBattle(channel: string, channelName: string): Promise<void> {
  const bossData = await redis.get(`boss:${channelName}`);
  if (!bossData) return;

  const boss: BossData = JSON.parse(bossData);
  if (boss.status !== 'recruiting') return;

  boss.status = 'active';
  await redis.set(`boss:${channelName}`, JSON.stringify(boss));

  await this.client.say(channel, 
    `The battle against ${boss.name} (Level ${boss.level}) begins! ` +
    `${boss.participants.length} warriors charge into battle!`
  );

  // Run battle rounds
  let round = 1;
  const battleInterval = setInterval(async () => {
    const result = await runBattleRound(channel, channelName, round);
    if (result || round >= 5) {
      clearInterval(battleInterval);
    }
    round++;
  }, 15000);
}

async function runBattleRound(
  channel: string, 
  channelName: string, 
  round: number
): Promise<boolean> {
  const bossData = await redis.get(`boss:${channelName}`);
  if (!bossData) return true;

  const boss: BossData = JSON.parse(bossData);
  if (boss.status !== 'active') return true;

  const selectedBoss = BOSSES.find(b => b.name === boss.name)!;

  // Boss attacks
  const ability = selectedBoss.abilities[Math.floor(Math.random() * selectedBoss.abilities.length)];
  await this.client.say(channel, `Round ${round}: ${boss.name} uses ${ability}!`);

  // Warriors attack
  let totalDamage = 0;
  for (const warrior of boss.participants) {
    const damage = Math.floor(warrior.points * (0.5 + Math.random()));
    warrior.damage += damage;
    totalDamage += damage;
  }

  boss.health -= totalDamage;
  await this.client.say(channel, 
    `The warriors deal ${totalDamage} damage! ` +
    `${boss.name}'s health: ${Math.max(0, boss.health)}/${boss.maxHealth}`
  );

  if (boss.health <= 0) {
    await endBattle(channel, channelName, true);
    return true;
  }

  if (round >= 5) {
    await endBattle(channel, channelName, false);
    return true;
  }

  await redis.set(`boss:${channelName}`, JSON.stringify(boss));
  return false;
}

async function endBattle(channel: string, channelName: string, victory: boolean): Promise<void> {
  const bossData = await redis.get(`boss:${channelName}`);
  if (!bossData) return;

  const boss: BossData = JSON.parse(bossData);
  const selectedBoss = BOSSES.find(b => b.name === boss.name)!;
  const loyaltyService = new LoyaltyService();

  if (victory) {
    // Increase boss level
    const newLevel = boss.level + 1;
    await redis.set(`bosslevel:${channelName}`, newLevel.toString());

    // Calculate rewards
    for (const warrior of boss.participants) {
      const multiplier = selectedBoss.minReward + 
        Math.random() * (selectedBoss.maxReward - selectedBoss.minReward);
      const reward = Math.floor(warrior.points * multiplier);
      const bonusReward = Math.floor((warrior.damage / boss.maxHealth) * boss.level * 1000);
      const totalReward = reward + bonusReward;

      await loyaltyService.addPoints({
        userId: channelName,
        channelId: channelName,
        targetUserId: warrior.username.toLowerCase(),
        points: totalReward,
        reason: 'boss_victory'
      });

      await this.client.say(channel, 
        `@${warrior.username} dealt ${warrior.damage} damage and earned ${totalReward} points! ` +
        `(${reward} base + ${bonusReward} bonus)`
      );
    }

    await this.client.say(channel, 
      `Victory! ${boss.name} (Level ${boss.level}) has been defeated! ` +
      `The next boss will be Level ${newLevel}!`
    );
  } else {
    await this.client.say(channel, 
      `Defeat! ${boss.name} (Level ${boss.level}) was too strong! ` +
      `The warriors dealt ${boss.maxHealth - boss.health} damage but failed to defeat it.`
    );
  }

  boss.status = 'ended';
  await redis.del(`boss:${channelName}`);
} 