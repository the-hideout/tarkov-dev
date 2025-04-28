# Bot Configuration Guide

This guide explains how to configure and customize the UltimateTwitchBot.

## Environment Variables

Create a `.env` file in the bot directory with the following variables:

```env
# Twitch Configuration
TWITCH_BOT_USERNAME=your_bot_username
TWITCH_OAUTH_TOKEN=oauth:your_oauth_token
TWITCH_CHANNEL=your_channel_name

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=ultimate_twitch_bot

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# API Keys
DEEPSEEK_API_KEY=your_deepseek_api_key
TARKOV_API_URL=https://api.tarkov.dev/graphql

# Web Server Configuration
WEB_PORT=3000
WEB_HOST=localhost
JWT_SECRET=your_jwt_secret

# Feature Flags
ENABLE_AI_MODERATION=true
ENABLE_EFT_INTEGRATION=true
ENABLE_MUSIC_PLAYER=true

# Logging
LOG_LEVEL=info
LOG_FILE=bot.log
```

## Command Configuration

Commands are stored in Redis and can be managed through the web dashboard or API. Here's an example command configuration:

```json
{
  "trigger": "!hello",
  "response": "Welcome, $(user)! Enjoy $(game).",
  "permission": "everyone",
  "cooldown": 10
}
```

### Command Variables

The following variables can be used in command responses:

- `$(user)` - The username of the user who triggered the command
- `$(game)` - The current game being played
- `$(args)` - Any additional arguments passed to the command

### Permissions

Available permission levels:
- `everyone` - Anyone can use the command
- `subscriber` - Only subscribers can use the command
- `mod` - Only moderators can use the command
- `vip` - Only VIPs can use the command
- `broadcaster` - Only the channel owner can use the command

## Moderation Configuration

Moderation settings can be configured through the web dashboard or API. Here's an example configuration:

```json
{
  "maxCapsPercentage": 70,
  "maxMessageLength": 500,
  "spamThreshold": 3,
  "blacklistedWords": ["badword1", "badword2"],
  "blacklistedUrls": ["spam.com", "malware.com"]
}
```

## EFT Integration

The bot supports the following EFT commands:

- `!price <item>` - Get current market price
- `!traderprice <item>` - Compare trader prices
- `!pricehistory <item>` - View price history
- `!supply <item>` - Check supply statistics

## Web Dashboard

The web dashboard is available at `http://localhost:3000` by default. It provides:

- Command management
- Moderation settings
- EFT integration console
- Real-time chat monitoring
- Analytics and reporting

## API Endpoints

### Commands
- `GET /api/commands` - List all commands
- `POST /api/commands` - Create a new command
- `DELETE /api/commands/:trigger` - Delete a command

### Moderation
- `GET /api/moderation/settings` - Get moderation settings
- `POST /api/moderation/settings` - Update moderation settings

### EFT Integration
- `GET /api/eft/price/:item` - Get item price
- `GET /api/eft/trader/:item` - Get trader prices
- `GET /api/eft/history/:item` - Get price history

## Troubleshooting

### Common Issues

1. **Bot not connecting to Twitch**
   - Verify OAuth token is valid
   - Check channel name is correct
   - Ensure bot has necessary permissions

2. **Commands not working**
   - Check command permissions
   - Verify command syntax
   - Check Redis connection

3. **Moderation not working**
   - Verify moderation settings
   - Check Redis connection
   - Ensure bot has moderator permissions

### Logs

Logs are stored in the specified log file. Common log levels:
- `error` - Critical errors
- `warn` - Warning messages
- `info` - General information
- `debug` - Detailed debugging information

## Support

For additional support:
- Check the [GitHub repository](https://github.com/yourusername/ultimate-twitch-bot)
- Join our [Discord server](https://discord.gg/your-server)
- Open a GitHub issue 