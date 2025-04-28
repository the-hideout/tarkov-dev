const { ScheduledTask, TaskHistory } = require('../database/models');
const { scheduleTask, unscheduleTask } = require('../scheduler');
const logger = require('../utils/logger');

class TaskController {
  // Create a new scheduled task
  async createTask(req, res) {
    try {
      const task = await ScheduledTask.create(req.body);
      if (task.isEnabled) {
        await scheduleTask(task);
      }
      res.status(201).json(task);
    } catch (error) {
      logger.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  // Get all tasks for a channel
  async getChannelTasks(req, res) {
    try {
      const tasks = await ScheduledTask.findAll({
        where: { channelId: req.params.channelId },
        include: [{
          model: TaskHistory,
          limit: 1,
          order: [['createdAt', 'DESC']]
        }]
      });
      res.json(tasks);
    } catch (error) {
      logger.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  // Get a specific task
  async getTask(req, res) {
    try {
      const task = await ScheduledTask.findByPk(req.params.taskId, {
        include: [{
          model: TaskHistory,
          limit: 5,
          order: [['createdAt', 'DESC']]
        }]
      });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      logger.error('Error fetching task:', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  }

  // Update a task
  async updateTask(req, res) {
    try {
      const task = await ScheduledTask.findByPk(req.params.taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Unschedule if task is currently enabled
      if (task.isEnabled) {
        unscheduleTask(task.id);
      }

      // Update task
      await task.update(req.body);

      // Reschedule if task is now enabled
      if (task.isEnabled) {
        await scheduleTask(task);
      }

      res.json(task);
    } catch (error) {
      logger.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }

  // Delete a task
  async deleteTask(req, res) {
    try {
      const task = await ScheduledTask.findByPk(req.params.taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Unschedule if task is enabled
      if (task.isEnabled) {
        unscheduleTask(task.id);
      }

      await task.destroy();
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }

  // Get task history
  async getTaskHistory(req, res) {
    try {
      const history = await TaskHistory.findAll({
        where: { taskId: req.params.taskId },
        order: [['createdAt', 'DESC']],
        limit: 50
      });
      res.json(history);
    } catch (error) {
      logger.error('Error fetching task history:', error);
      res.status(500).json({ error: 'Failed to fetch task history' });
    }
  }

  // Execute a task immediately
  async executeTask(req, res) {
    try {
      const task = await ScheduledTask.findByPk(req.params.taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

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

      res.json({ message: 'Task executed successfully', history });
    } catch (error) {
      logger.error('Error executing task:', error);
      
      // Update history with error
      await TaskHistory.create({
        taskId: req.params.taskId,
        status: 'failed',
        error: error.message
      });

      res.status(500).json({ error: 'Failed to execute task' });
    }
  }
}

module.exports = new TaskController(); 