const { ScheduledTask, TaskHistory } = require('./database/models');
const { publishTask } = require('./utils/messageQueue');
const logger = require('./utils/logger');
const cron = require('node-cron');

let scheduledJobs = new Map();

// Execute a scheduled task
const executeTask = async (task) => {
  try {
    // Create history entry
    const history = await TaskHistory.create({
      taskId: task.id,
      status: 'success',
      result: null
    });

    // Publish task to message queue
    await publishTask({
      type: task.type,
      channelId: task.channelId,
      action: task.action
    });

    // Update task last run time
    await task.update({
      lastRun: new Date()
    });

    logger.info(`Executed task ${task.name} for channel ${task.channelId}`);
  } catch (error) {
    logger.error(`Error executing task ${task.name}:`, error);
    
    // Update history with error
    await TaskHistory.create({
      taskId: task.id,
      status: 'failed',
      error: error.message
    });
  }
};

// Schedule a task
const scheduleTask = async (task) => {
  try {
    // Parse cron schedule
    const job = cron.schedule(task.schedule, async () => {
      if (task.isEnabled) {
        await executeTask(task);
      }
    });

    // Store job reference
    scheduledJobs.set(task.id, job);

    // Calculate next run time
    const nextRun = job.nextDate().toDate();
    await task.update({ nextRun });

    logger.info(`Scheduled task ${task.name} with schedule ${task.schedule}`);
  } catch (error) {
    logger.error(`Error scheduling task ${task.name}:`, error);
  }
};

// Unschedule a task
const unscheduleTask = (taskId) => {
  const job = scheduledJobs.get(taskId);
  if (job) {
    job.stop();
    scheduledJobs.delete(taskId);
    logger.info(`Unscheduled task ${taskId}`);
  }
};

// Load and schedule all enabled tasks
const loadTasks = async () => {
  try {
    const tasks = await ScheduledTask.findAll({
      where: { isEnabled: true }
    });

    for (const task of tasks) {
      await scheduleTask(task);
    }

    logger.info(`Loaded ${tasks.length} scheduled tasks`);
  } catch (error) {
    logger.error('Error loading tasks:', error);
  }
};

// Setup scheduler
const setupScheduler = async () => {
  try {
    // Load existing tasks
    await loadTasks();

    // Watch for task changes
    ScheduledTask.afterCreate(async (task) => {
      if (task.isEnabled) {
        await scheduleTask(task);
      }
    });

    ScheduledTask.afterUpdate(async (task) => {
      if (task.isEnabled) {
        await scheduleTask(task);
      } else {
        unscheduleTask(task.id);
      }
    });

    ScheduledTask.afterDestroy((task) => {
      unscheduleTask(task.id);
    });

    logger.info('Scheduler setup complete');
  } catch (error) {
    logger.error('Failed to setup scheduler:', error);
    throw error;
  }
};

module.exports = {
  setupScheduler,
  scheduleTask,
  unscheduleTask,
  executeTask
}; 