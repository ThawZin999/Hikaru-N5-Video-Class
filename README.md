# Hikaru N5 Class Telegram Bot

## Setup Instructions

1. Create a `.env` file in the root directory with the following variables:

```
BOT_TOKEN=your_telegram_bot_token
WEBHOOK_URL=https://your-vercel-domain.vercel.app/api/webhook
```

2. Deploy to Vercel:

```bash
vercel
```

3. After deployment, copy your Vercel domain URL and set it as WEBHOOK_URL in your .env file.

4. Redeploy to apply the environment variables:

```bash
vercel --prod
```

## Important Notes

- Make sure your bot token is valid and the bot is active
- The webhook URL must be HTTPS
- The webhook URL should point to your Vercel deployment
- Only approved users can interact with the bot
- Admin commands: `/adduser <id>` and `/removeuser <id>`
