import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import { Logger } from '../utils/logger';
import { RedisService } from '../services/redis';

export class WebServer {
  private app: express.Application;
  private server: http.Server;
  private io: Server;
  private logger: Logger;
  private redis: RedisService;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server);
    this.logger = new Logger('webserver');
    this.redis = new RedisService();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketIO();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // API routes
    this.app.get('/api/commands', async (req, res) => {
      try {
        const commands = await this.redis.get('commands');
        res.json(JSON.parse(commands || '[]'));
      } catch (error) {
        this.logger.error('Failed to fetch commands:', error);
        res.status(500).json({ error: 'Failed to fetch commands' });
      }
    });

    this.app.post('/api/commands', async (req, res) => {
      try {
        const command = req.body;
        await this.redis.set('commands', JSON.stringify(command));
        this.io.emit('commandUpdate', command);
        res.json({ success: true });
      } catch (error) {
        this.logger.error('Failed to save command:', error);
        res.status(500).json({ error: 'Failed to save command' });
      }
    });

    this.app.delete('/api/commands/:trigger', async (req, res) => {
      try {
        const { trigger } = req.params;
        const commands = JSON.parse(await this.redis.get('commands') || '[]');
        const updatedCommands = commands.filter((cmd: any) => cmd.trigger !== trigger);
        await this.redis.set('commands', JSON.stringify(updatedCommands));
        this.io.emit('commandDelete', trigger);
        res.json({ success: true });
      } catch (error) {
        this.logger.error('Failed to delete command:', error);
        res.status(500).json({ error: 'Failed to delete command' });
      }
    });
  }

  private setupSocketIO(): void {
    this.io.on('connection', (socket) => {
      this.logger.info('New client connected');

      socket.on('disconnect', () => {
        this.logger.info('Client disconnected');
      });

      // Handle chat events
      socket.on('chatMessage', (data) => {
        this.io.emit('chatMessage', data);
      });

      // Handle command events
      socket.on('commandExecuted', (data) => {
        this.io.emit('commandExecuted', data);
      });
    });
  }

  public start(): void {
    const port = parseInt(process.env.WEB_PORT || '3000');
    this.server.listen(port, () => {
      this.logger.info(`Web server listening on port ${port}`);
    });
  }

  public async close(): Promise<void> {
    try {
      await this.redis.close();
      this.server.close();
      this.logger.info('Web server closed');
    } catch (error) {
      this.logger.error('Error closing web server:', error);
    }
  }
} 